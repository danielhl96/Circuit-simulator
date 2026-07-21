
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
        Vgs: [] as number[],
        Id_Vgs: [] as number[],
        Id_Vds: [] as number[]
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
    Gate_Length: 5e-9,
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
    this.state.update( m => {
      // 1. Cox: reine Geometrie (ε_ox / t_ox), keine Abhängigkeiten
      const Cox = this.calculcateCox();

      // 2. Vth: hängt von Cox, Na/Nd, Vsb, Vfb, T ab
      const Vth = this.calculateThresholdVoltageWith(Cox, m);

      // 3. Id (1. Iteration): nutzt neues Vth/Cox, aber altes lambda (Startwert)
      const Id0 = this.calculateDrainCurrentWith(true, m.Vgs, m.Vds, Vth, Cox, m.lambda, m.Gate_Length, m.Gate_Width);

      // 4. lambda: hängt von Id0 ab
      const lambda = this.calculateChannelLengthModulationWith(Id0, m.Vgs, Vth, m.Vds, m.Gate_Length);

      // 5. Id (2. Iteration): jetzt mit korrektem lambda → physikalisch konsistent
      const Id = this.calculateDrainCurrentWith(true, m.Vgs, m.Vds, Vth, Cox, lambda, m.Gate_Length, m.Gate_Width);

      // 6. gm: hängt von Vgs, Vth, Cox, W/L ab
      const gm = this.calculateTransconductanceWith(m.Vgs, Vth, Cox, m.Gate_Width, m.Gate_Length);

      // 7. ro: hängt von lambda und finalem Id ab
      const ro = this.calculateOutputResistanceWith(m.Vgs, Vth, m.Vds, lambda, Id);

      // 8. Gate_Length effektiv: hängt von lambda ab
      const Gate_Length = this.calculateChannelLengthAfterModulationWith(m.Gate_Length, lambda, m.Vgs, Vth, m.Vds);

      return { ...m, Cox, Vth, Id, lambda, gm, ro, Gate_Length };
    });
  }

  public calculcateCox(): number {
    // Cox = ε_ox / t_ox
    const eps_ox = 3.45e-11; // Relative permittivity of SiO2 in F/m
    return eps_ox / this.state().Oxide_Thickness;
  }


  public getSimulationResultsByVgs(): {Vgs: number[]; Id_Vgs: number[]; } {
    const VgsValues = [0, 1, 2, 3, 4, 5]; // Example gate-source voltages
    const results: { Vgs: number[]; Id_Vgs: number[] } = {
      Vgs: [],
      Id_Vgs: []
    };

  for (const Vgs of VgsValues) {
          const Id = this.calculateDrainCurrent(true, Vgs, 5);
          results.Vgs.push(Vgs);
          results.Id_Vgs.push(Id);
        }
        return results;
      }

  public getSimulationResultsByVds(): { Vds: number[]; Id_Vds: number[] } {
    const VdsValues = Array.from({ length: 11 }, (_, i) => i); // Vds from 0 to 10V

    const results: { Vds: number[]; Id_Vds: number[] } = {
      Vds: [],
      Id_Vds: []
    };
      for (const Vds of VdsValues) {
        const Id = this.calculateDrainCurrent(true, 5, Vds);
        results.Vds.push(Vds);
        results.Id_Vds.push(Id);
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
    Gate_Length:5e-9,
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

    /** Parametrisierte Kernberechnung – liest kein this.state() */
    public calculateDrainCurrentWith(
        RealFet: boolean, Vgs: number, Vds: number,
        Vth: number, Cox: number, lambda: number,
        Gate_Length: number, Gate_Width: number,
        type: string = this.state().Type
    ): number {
        const sign = type === 'N' ? 1 : -1;
        const Vth_signed = sign * Vth;
        const kn = this.ELECTRON_MOBILITY * Cox * (Gate_Width / Gate_Length);
        if (Vgs <= Vth_signed) {
            return 0; // Cutoff region
        } else if (Vds < (Vgs - Vth_signed)) {
            // Triode region
            return sign * kn * ((Vgs - Vth_signed) * Vds - (Vds ** 2) / 2);
        } else {
            // Saturation region
            if (RealFet) {
                return sign * 0.5 * kn * (Vgs - Vth_signed) ** 2 * (1 + lambda * Vds);
            } else {
                return sign * 0.5 * kn * (Vgs - Vth_signed) ** 2;
            }
        }
    }

    /** Wrapper für externe Aufrufer (liest aktuellen state) */
    public calculateDrainCurrent(RealFet: boolean, Vgs: number, Vds: number): number {
        const m = this.state();
        return this.calculateDrainCurrentWith(RealFet, Vgs, Vds, m.Vth, m.Cox, m.lambda, m.Gate_Length, m.Gate_Width, m.Type);
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

    /** Parametrisierte Kernberechnung – liest kein this.state() */
    public calculateThresholdVoltageWith(Cox: number, m: ReturnType<typeof this.state>): number {
        const thermalVoltage = (m.k * m.T) / this.ELECTRON_CHARGE;
        const isNChannel = m.Type === 'N';
        const dopingSubstrate = isNChannel ? m.Na : m.Nd;
        const sign = isNChannel ? 1 : -1;

        const phi_F = sign * thermalVoltage *
            Math.log(dopingSubstrate / this.INTRINSIC_CARRIER_CONCENTRATION);
        const surfacePotential = 2 * phi_F;

        const bodyTerm = Math.abs(surfacePotential) + sign * m.Vsb;
        const bulkChargeTerm = Math.sqrt(
            2 * this.ELECTRON_CHARGE * this.eps_s * dopingSubstrate * Math.max(bodyTerm, 0)
        );
        return m.Vfb + surfacePotential + sign * (bulkChargeTerm / Cox);
    }

    /** Wrapper für externe Aufrufer */
    public calculateThresholdVoltage(): number {
        return this.calculateThresholdVoltageWith(this.state().Cox, this.state());
    }

    /** Parametrisierte Kernberechnung */
    public calculateTransconductanceWith(
        Vgs: number, Vth: number, Cox: number,
        Gate_Width: number, Gate_Length: number,
        Vds: number = this.state().Vds
    ): number {
        const sign = this.state().Type === 'N' ? 1 : -1;
        const Vth_signed = sign * Vth;
        if (Vgs > Vth_signed && Vds >= (Vgs - Vth_signed)) {
            return this.ELECTRON_MOBILITY * Cox * (Gate_Width / Gate_Length) * (Vgs - Vth_signed);
        }
        return 0;
    }

    /** Wrapper für externe Aufrufer */
    public calculateTransconductance(): number {
        const m = this.state();
        return this.calculateTransconductanceWith(m.Vgs, m.Vth, m.Cox, m.Gate_Width, m.Gate_Length, m.Vds);
    }

    /** Parametrisierte Kernberechnung */
    public calculateOutputResistanceWith(
        Vgs: number, Vth: number, Vds: number,
        lambda: number, Id: number,
        type: string = this.state().Type
    ): number {
        const sign = type === 'N' ? 1 : -1;
        const Vth_signed = sign * Vth;
        if (Vgs < Vth_signed) return this.MAX_RESISTANCE;
        const Vds_sat = Vgs - Vth_signed;
        if (Vds >= Vds_sat && lambda > 0 && Id > 0) {
            return 1 / (lambda * Id);
        }
        return this.MAX_RESISTANCE;
    }

    /** Wrapper für externe Aufrufer */
    public calculateOutputResistance(Id0: number): number {
        const m = this.state();
        return this.calculateOutputResistanceWith(m.Vgs, m.Vth, m.Vds, m.lambda, Id0, m.Type);
    }   

    /** Parametrisierte Kernberechnung */
    public calculateChannelLengthModulationWith(
        Id0: number, Vgs: number, Vth: number,
        Vds: number, Gate_Length: number,
        type: string = this.state().Type
    ): number {
        if (Id0 <= 0) return 0;
        const sign = type === 'N' ? 1 : -1;
        const Vth_signed = sign * Vth;
        if (Vgs > Vth_signed && Vds >= (Vgs - Vth_signed)) {
            return 1 / (Gate_Length * Math.sqrt(Id0));
        }
        return 0;
    }

    /** Wrapper für externe Aufrufer */
    public calculateChannelLengthModulation(Id0: number): number {
        const m = this.state();
        return this.calculateChannelLengthModulationWith(Id0, m.Vgs, m.Vth, m.Vds, m.Gate_Length, m.Type);
    }

    /** Parametrisierte Kernberechnung */
    public calculateChannelLengthAfterModulationWith(
        Gate_Length: number, lambda: number,
        Vgs: number, Vth: number, Vds: number,
        type: string = this.state().Type
    ): number {
        const sign = type === 'N' ? 1 : -1;
        const Vth_signed = sign * Vth;
        if (Vgs > Vth_signed && Vds >= (Vgs - Vth_signed)) {
            const Vds_excess = Vds - (Vgs - Vth_signed);
            const L_eff = Gate_Length / (1 + lambda * Vds_excess);
            return Math.max(L_eff, Gate_Length * 0.1);
        }
        return Gate_Length;
    }

    /** Wrapper für externe Aufrufer */
    public calculateChannelLengthAfterModulation(): number {
        const m = this.state();
        return this.calculateChannelLengthAfterModulationWith(m.Gate_Length, m.lambda, m.Vgs, m.Vth, m.Vds, m.Type);
    }


}
   