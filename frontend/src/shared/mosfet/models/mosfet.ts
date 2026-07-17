
import { signal, ViewChild } from '@angular/core';
import { CharacteristicCurvesComponent } from '../../characteristic-curves/characteristic-curves.component';
export class Mosfet {
    public readonly ELECTRON_MOBILITY: number = 0.05; // m^2/Vs
    public readonly THRESHOLD_VOLTAGE: number = 1.0; // V
    public readonly GATE_CAPACITANCE: number = 1e-9; // F
    public readonly ELECTRON_CHARGE: number = 1.602e-19; // C
    public readonly INTRINSIC_CARRIER_CONCENTRATION: number = 1.5e10; // Intrinsic carrier concentration of silicon at 300K (in cm^-3)
    public readonly eps_0 = 8.854e-14; // Electric constant in F/cm
    public readonly eps_r_si = 11.7; // Relative permittivity of silicon
    public readonly eps_s = this.eps_0 * this.eps_r_si;
    public readonly MIN_RESISTANCE = 1e-6; // Minimum resistance to avoid division by zero
    public readonly MAX_RESISTANCE = 1e6; // Maximum resistance to avoid unrealistic values
    public simulationsResults = signal({
        Vds: [] as number[],
        Id: [] as number[]
    });
    public state = signal({
    Vds: 0,
    Vgs: 0,
    Vth: 1,
    Id: 0,
    ID: 0,
    Input_Node: '',
    Output_Node: '',
    Source_Node: '',
    Drain_Node: '',
    Gate_Node: '',
    Type: 'N',
    Gate_Length: 10e-9,
    Gate_Width: 7e-9,
    Oxide_Thickness: 1e-9,
    Vsb: 0,
    Vfb: 0,
    Cox: 1e-9,
    gm: 0,
    ro: 0,
    lambda: 0,
    Na: 1e17,
    Nd: 1e20,
    Source_Drain_Length: 0.5e-6,
    Source_Drain_Area: 1e-12,
    Vt: 0.026,
    k: 1.38e-23,
    T: 300
  })

  constructor(
  
    ) {}

  update() {
    this.state.update(m => ({
        
      ...m,
        Id: this.calculateDrainCurrent(true, m.Vgs, m.Vds),
        
    }));

    console.log('Updated MOSFET state:', this.state());
  }

  public getSimulationResults(): { Vds: number[]; Id: number[] } {
    const VgsValues = [0, 1, 2, 3, 4, 5]; // Example gate-source voltages
    const VdsValues = Array.from({ length: 11 }, (_, i) => i); // Vds from 0 to 10V

    const results: { Vds: number[]; Id: number[] } = {
      Vds: [],
      Id: []
    };

   
      for (const Vds of VdsValues) {
        const Id = this.calculateDrainCurrent(true, 5, Vds);
        results.Vds.push(Vds);
        results.Id.push(Id);
      }
    

    return results;
  }

  public deleteMosfet(): void {
    // Reset all properties to their default values
    this.state.update( m=> ({
        ...m,
      Vds: 0,
      Vgs: 0,
      Vth: 1,
      Id: 0,
      ID: 0,
      Input_Node: '',
      Output_Node: '',
      Source_Node: '',
      Drain_Node: '',
      Gate_Node: '',    
    Type: 'N',
    Gate_Length: 10e-9,
    Gate_Width: 7e-9,
    Oxide_Thickness: 1e-9,
    Vsb: 0,
    Vfb: 0,
    Cox: 1e-9,
    gm: 0,
    ro: 0,
    lambda: 0,
    Na: 1e17,
    Nd: 1e20,
    Source_Drain_Length: 0.5e-6,
    Source_Drain_Area: 1e-12,
    Vt: 0.026,
    k: 1.38e-23,
    T: 300
    }));

  }


    public calculateDrainCurrentbyUds(vgs: number): number[] {
        const results: number[] = [];
        for(let Vds = 0; Vds <= 10; Vds += 1) {
            results.push(this.calculateDrainCurrent(true, vgs, Vds));
        }
        return results;
       
    }

    public getValues(): Record<string, [number,string]> {
        //get all the relevant values of the MOSFET for display or further calculations
         const m = this.state();
        return {
            Vgs: [m.Vgs, "V"],
            Vds: [m.Vds, "V"],
            Vsb: [m.Vsb, "V"],
            Vth: [m.Vth, "V"],
            Id: [m.Id, "A"],
            gm: [m.gm, "S"],
            ro: [m.ro, "Ω"],
            lambda: [m.lambda, "1/V"],
            Gate_Length: [m.Gate_Length*1e9, "nm"],  // Convert to nanometers for display
            Gate_Width: [m.Gate_Width*1e9, "nm"],  // Convert to nanometers for display
            Oxide_Thickness: [m.Oxide_Thickness*1e9, "nm"],  // Convert to nanometers for display
            Na: [m.Na*1e-6, "cm^-3"],  // Convert to cm^-3 for display
            Nd: [m.Nd*1e-6, "cm^-3"],  // Convert to cm^-3 for display
            Source_Drain_Length: [m.Source_Drain_Length*1e9, "nm"],  // Convert to nanometers for display
            Source_Drain_Area: [m.Source_Drain_Area, "m^2"],  // Convert to square meters for display
            Vt: [m.Vt, "V"],
            k: [m.k, "J/K"],
            T: [m.T, "K"],  
        };
    }

    public calculateDrainCurrent(RealFet: boolean,Vgs:number,Vds:number): number {
        const sign = this.state().Type === 'N' ? 1 : -1;
        
        const Vth = sign * this.state().Vth;
        const kn = this.ELECTRON_MOBILITY * this.state().Cox * (this.state().Gate_Width / this.state().Gate_Length);

        if (Vgs <= Vth) {
            return 0; // Cutoff region
        } else if (Vds < (Vgs - Vth)) {
            // Triode region
            return sign * kn * ((Vgs - Vth) * Vds - (Vds ** 2) / 2);
        } else {
            // Saturation region
            if (RealFet) {
                return sign * 0.5 * kn * (Vgs - Vth) ** 2 * (1 + this.state().lambda * Vds);
            } else {
                return sign * 0.5 * kn * (Vgs - Vth) ** 2;
            }
        }
    }

    public calculateBuiltInPotential(): number {
        // V_bi = Vt * ln(Na * Nd / ni^2)
        // Relevant for S/D junction and body effect
        const ni = this.INTRINSIC_CARRIER_CONCENTRATION;
        return this.state().Vt * Math.log((this.state().Na * this.state().Nd) / (ni * ni));
    }

    public calculateSourceDrainResistance(): number {
        // R_SD = L_SD / (q * Nd * mu_n * A)
        // Higher Nd → lower series resistance of n+ regions
        return this.state().Source_Drain_Length /
            (this.ELECTRON_CHARGE * this.state().Nd * this.ELECTRON_MOBILITY * this.state().Source_Drain_Area);
    }

    public calculateThresholdVoltage(): number {
        const thermalVoltage = (this.state().k * this.state().T) / this.ELECTRON_CHARGE;

        // N-Kanal: p-Substrat → Na relevant, phi_F positiv
        // P-Kanal: n-Substrat → Nd relevant, phi_F negativ → Vth negativ
        const isNChannel = this.state().Type === 'N';
        const dopingSubstrate = isNChannel ? this.state().Na : this.state().Nd;
        const sign = isNChannel ? 1 : -1;

        // Fermi-Potential
        const phi_F = sign * thermalVoltage *
            Math.log(dopingSubstrate / this.INTRINSIC_CARRIER_CONCENTRATION);

        // Oberflächenpotential bei starker Inversion: 2 * phi_F
        const surfacePotential = 2 * phi_F;

        // Body-Effekt: Vsb verschiebt Vth
        // Qb = sqrt(2 * q * eps_s * Na * (2*phi_F + Vsb))
        const bodyTerm = Math.abs(surfacePotential) + sign * this.state().Vsb;
        const bulkChargeTerm = Math.sqrt(
            2 * this.ELECTRON_CHARGE * this.eps_s * dopingSubstrate * Math.max(bodyTerm, 0)
        );

        // Vth = Vfb + 2*phi_F + Qb/Cox
        this.state().Vth = this.state().Vfb + surfacePotential + sign * (bulkChargeTerm / this.state().Cox);

        return this.state().Vth;
    }

    public calculateTransconductance(): number {
        if (this.state().Vgs > this.state().Vth && this.state().Vds >= (this.state().Vgs - this.state().Vth)) {
            this.state().gm = this.ELECTRON_MOBILITY * this.state().Cox * (this.state().Gate_Width / this.state().Gate_Length) * (this.state().Vgs - this.state().Vth);
            return this.state().gm;
        } else if(this.state().Vgs <= this.state().Vth) {
            this.state().gm = 0; // Transconductance is zero in cutoff and triode regions
        }

        return this.state().gm;
    }

    public calculateOutputResistance(Id0: number): number {
        if(this.state().Vgs < this.state().Vth){
            this.state().ro = this.MAX_RESISTANCE; // Very high resistance in cutoff region
            return this.state().ro;
        }
        const Vds_sat = this.state().Vgs - this.state().Vth;
        if (this.state().Vds >= Vds_sat) {
            // Saturation region
            this.state().ro = 1 / (this.state().lambda * Id0);
        } else {
            // Triode region
            this.state().ro = this.MAX_RESISTANCE; // Very high resistance in triode region
        }
        return this.state().ro;
    }   

    public calculateChannelLengthModulation(Id0: number): number {
        if(Id0 <= 0){
            this.state().lambda = 0; // Avoid division by zero or negative drain current
            return this.state().lambda;
        }
        if (this.state().Vgs > this.state().Vth && this.state().Vds >= (this.state().Vgs - this.state().Vth)) {
            this.state().lambda = 1 / (this.state().Gate_Length * Math.sqrt(Id0)); // Channel length modulation parameter in saturation region
        } else {
            this.state().lambda = 0; // No channel length modulation in cutoff and triode regions
        }
        return this.state().lambda;
    }

    public calculateChannelLengthAfterModulation(): number {
    // Check if the MOSFET is in saturation region
    if (this.state().Vgs > this.state().Vth && this.state().Vds >= (this.state().Vgs - this.state().Vth)) {
        const Vds_sat = this.state().Vgs - this.state().Vth;
        
        // The modulation only acts with the voltage that exceeds Vds_sat
        const Vds_excess = this.state().Vds - Vds_sat; 
        
        // Physically more accurate reduction of the channel length
        const L_eff = this.state().Gate_Length / (1 + this.state().lambda * Vds_excess);
        
        // Safety check: The channel length should not become negative or unrealistically short
        return Math.max(L_eff, this.state().Gate_Length * 0.1); 
    }
    
    // In cutoff and linear (triode) regions, L remains unchanged
    return this.state().Gate_Length;
}


}
   