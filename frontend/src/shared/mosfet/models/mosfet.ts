
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

    constructor(
        public ID = 0, //Identifier for the MOSFET 
        public Input_Node: string = '', // Input node of the MOSFET
        public Output_Node: string = '', // Output node of the MOSFET
        public Source_Node: string = '', // Source node of the MOSFET
        public Drain_Node: string = '', // Drain node of the MOSFET
        public Gate_Node: string = '', // Gate node of the MOSFET
        public Type: 'N' | 'P' = 'N', // Type of MOSFET (N-channel or P-channel)
        public Gate_Length: number = 10e-9, // m
        public Gate_Width: number = 7e-9, // m
        public Oxide_Thickness: number = 1e-9, // m
        public Vgs: number = 0, // V
        public Vds: number = 0, // V
        public Vsb: number = 0, // V Source-Bulk voltage (Body-Effekt)
        public Vth: number = 1.0, // V (= THRESHOLD_VOLTAGE)
        public Vfb: number = 0, // V
        public Cox: number = 1e-9, // F/m^2 (= GATE_CAPACITANCE)
        public Id: number = 0, // A
        public gm: number = 0, // S
        public ro: number = 0, // Resistance (Ohm)
        public lambda : number = 0, // 1/V Channel Length Modulation Parameter
        public Na = 1e17, // cm^-3 Substrat-Dotierung (p-Typ für N-Kanal)
        public Nd = 1e20, // cm^-3 Source/Drain-Dotierung (n+ für N-Kanal)
        public Source_Drain_Length: number = 0.5e-6, // m Länge der S/D-Gebiete
        public Source_Drain_Area: number = 1e-12,   // m^2 Querschnittsfläche S/D
        public Vt: number = 0.026, // V Thermal Voltage at room temperature
        public k: number = 1.38e-23, // J/K Boltzmann constant
        public T: number = 300, // K Temperature

    ) {}

    public getValues(): Record<string, [number,string]> {
        //get all the relevant values of the MOSFET for display or further calculations
        return {
            Vgs: [this.Vgs, "V"],
            Vds: [this.Vds, "V"],
            Vsb: [this.Vsb, "V"],
            Vth: [this.Vth, "V"],
            Id: [this.calculateDrainCurrent(true), "A"],
            gm: [this.gm, "S"],
            ro: [this.ro, "Ω"],
            lambda: [this.lambda, "1/V"],
            Gate_Length: [this.Gate_Length*1e9, "nm"],  // Convert to nanometers for display
            Gate_Width: [this.Gate_Width*1e9, "nm"],  // Convert to nanometers for display
            Oxide_Thickness: [this.Oxide_Thickness*1e9, "nm"],  // Convert to nanometers for display
            Na: [this.Na*1e-6, "cm^-3"],  // Convert to cm^-3 for display
            Nd: [this.Nd*1e-6, "cm^-3"],  // Convert to cm^-3 for display
            Source_Drain_Length: [this.Source_Drain_Length*1e9, "nm"],  // Convert to nanometers for display
            Source_Drain_Area: [this.Source_Drain_Area, "m^2"],  // Convert to square meters for display
            Vt: [this.Vt, "V"],
            k: [this.k, "J/K"],
            T: [this.T, "K"],  
        };
    }

    public calculateDrainCurrent(RealFet: boolean): number {
        const sign = this.Type === 'N' ? 1 : -1;
        const Vgs = sign * this.Vgs;
        const Vds = sign * this.Vds;
        const Vth = sign * this.Vth;
        const kn = this.ELECTRON_MOBILITY * this.Cox * (this.Gate_Width / this.Gate_Length);

        if (Vgs <= Vth) {
            this.Id = 0; // Cutoff region
        } else if (Vds < (Vgs - Vth)) {
            // Triode region
            this.Id = sign * kn * ((Vgs - Vth) * Vds - (Vds ** 2) / 2);
        } else {
            // Saturation region
            if (RealFet) {
                this.Id = sign * 0.5 * kn * (Vgs - Vth) ** 2 * (1 + this.lambda * Vds);
            } else {
                this.Id = sign * 0.5 * kn * (Vgs - Vth) ** 2;
            }
        }
        return this.Id;
    }

    public calculateBuiltInPotential(): number {
        // V_bi = Vt * ln(Na * Nd / ni^2)
        // Relevant for S/D junction and body effect
        const ni = this.INTRINSIC_CARRIER_CONCENTRATION;
        return this.Vt * Math.log((this.Na * this.Nd) / (ni * ni));
    }

    public calculateSourceDrainResistance(): number {
        // R_SD = L_SD / (q * Nd * mu_n * A)
        // Higher Nd → lower series resistance of n+ regions
        return this.Source_Drain_Length /
            (this.ELECTRON_CHARGE * this.Nd * this.ELECTRON_MOBILITY * this.Source_Drain_Area);
    }

    public calculateThresholdVoltage(): number {
        const thermalVoltage = (this.k * this.T) / this.ELECTRON_CHARGE;

        // N-Kanal: p-Substrat → Na relevant, phi_F positiv
        // P-Kanal: n-Substrat → Nd relevant, phi_F negativ → Vth negativ
        const isNChannel = this.Type === 'N';
        const dopingSubstrate = isNChannel ? this.Na : this.Nd;
        const sign = isNChannel ? 1 : -1;

        // Fermi-Potential
        const phi_F = sign * thermalVoltage *
            Math.log(dopingSubstrate / this.INTRINSIC_CARRIER_CONCENTRATION);

        // Oberflächenpotential bei starker Inversion: 2 * phi_F
        const surfacePotential = 2 * phi_F;

        // Body-Effekt: Vsb verschiebt Vth
        // Qb = sqrt(2 * q * eps_s * Na * (2*phi_F + Vsb))
        const bodyTerm = Math.abs(surfacePotential) + sign * this.Vsb;
        const bulkChargeTerm = Math.sqrt(
            2 * this.ELECTRON_CHARGE * this.eps_s * dopingSubstrate * Math.max(bodyTerm, 0)
        );

        // Vth = Vfb + 2*phi_F + Qb/Cox
        this.Vth = this.Vfb + surfacePotential + sign * (bulkChargeTerm / this.Cox);

        return this.Vth;
    }

    public calculateTransconductance(): number {
        if (this.Vgs > this.Vth && this.Vds >= (this.Vgs - this.Vth)) {
            this.gm = this.ELECTRON_MOBILITY * this.Cox * (this.Gate_Width / this.Gate_Length) * (this.Vgs - this.Vth);
            return this.gm;
        } else if(this.Vgs <= this.Vth) {
            this.gm = 0; // Transconductance is zero in cutoff and triode regions
        }

        return this.gm;
    }

    public calculateOutputResistance(Id0: number): number {
        if(this.Vgs < this.Vth){
            this.ro = this.MAX_RESISTANCE; // Very high resistance in cutoff region
            return this.ro;
        }
        const Vds_sat = this.Vgs - this.Vth;
        if (this.Vds >= Vds_sat) {
            // Saturation region
            this.ro = 1 / (this.lambda * Id0);
        } else {
            // Triode region
            this.ro = this.MAX_RESISTANCE; // Very high resistance in triode region
        }
        return this.ro;
    }   

    public calculateChannelLengthModulation(Id0: number): number {
        if(Id0 <= 0){
            this.lambda = 0; // Avoid division by zero or negative drain current
            return this.lambda;
        }
        if (this.Vgs > this.Vth && this.Vds >= (this.Vgs - this.Vth)) {
            this.lambda = 1 / (this.Gate_Length * Math.sqrt(Id0)); // Channel length modulation parameter in saturation region
        } else {
            this.lambda = 0; // No channel length modulation in cutoff and triode regions
        }
        return this.lambda;
    }

    public calculateChannelLengthAfterModulation(): number {
    // Check if the MOSFET is in saturation region
    if (this.Vgs > this.Vth && this.Vds >= (this.Vgs - this.Vth)) {
        const Vds_sat = this.Vgs - this.Vth;
        
        // The modulation only acts with the voltage that exceeds Vds_sat
        const Vds_excess = this.Vds - Vds_sat; 
        
        // Physically more accurate reduction of the channel length
        const L_eff = this.Gate_Length / (1 + this.lambda * Vds_excess);
        
        // Safety check: The channel length should not become negative or unrealistically short
        return Math.max(L_eff, this.Gate_Length * 0.1); 
    }
    
    // In cutoff and linear (triode) regions, L remains unchanged
    return this.Gate_Length;
}


}
   