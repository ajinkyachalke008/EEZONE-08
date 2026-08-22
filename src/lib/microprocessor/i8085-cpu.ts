// Intel 8085 8-bit Microprocessor Simulation Core & Assembler

export interface I8085Flags {
  S: boolean;   // Sign
  Z: boolean;   // Zero
  AC: boolean;  // Auxiliary Carry
  P: boolean;   // Parity
  CY: boolean;  // Carry
}

export interface I8085State {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  H: number;
  L: number;
  SP: number;
  PC: number;
  flags: I8085Flags;
  cycles: number;
  isHalted: boolean;
}

export class Intel8085 {
  public memory: Uint8Array = new Uint8Array(65536); // 64KB memory map
  public A: number = 0;
  public B: number = 0;
  public C: number = 0;
  public D: number = 0;
  public E: number = 0;
  public H: number = 0;
  public L: number = 0;
  public SP: number = 0xFFFF;
  public PC: number = 0x0800; // Standard user program start address
  public flags: I8085Flags = { S: false, Z: false, AC: false, P: false, CY: false };
  public cycles: number = 0;
  public isHalted: boolean = false;

  constructor() {
    this.reset();
  }

  public reset() {
    this.A = 0;
    this.B = 0;
    this.C = 0;
    this.D = 0;
    this.E = 0;
    this.H = 0;
    this.L = 0;
    this.SP = 0xFFFF;
    this.PC = 0x0800;
    this.flags = { S: false, Z: true, AC: false, P: true, CY: false };
    this.cycles = 0;
    this.isHalted = false;
  }

  public triggerInterrupt(type: 'TRAP' | 'RST75' | 'RST65' | 'RST55' | 'INTR') {
    // Push return address onto stack
    const ret = this.PC;
    this.SP = (this.SP - 1) & 0xFFFF;
    this.memory[this.SP] = (ret >> 8) & 0xFF;
    this.SP = (this.SP - 1) & 0xFFFF;
    this.memory[this.SP] = ret & 0xFF;

    // Vector redirection
    if (type === 'TRAP') this.PC = 0x0024;
    else if (type === 'RST75') this.PC = 0x003C;
    else if (type === 'RST65') this.PC = 0x0034;
    else if (type === 'RST55') this.PC = 0x002C;
    else if (type === 'INTR') this.PC = 0x0038;

    this.isHalted = false;
  }

  public getState(): I8085State {
    return {
      A: this.A,
      B: this.B,
      C: this.C,
      D: this.D,
      E: this.E,
      H: this.H,
      L: this.L,
      SP: this.SP,
      PC: this.PC,
      flags: { ...this.flags },
      cycles: this.cycles,
      isHalted: this.isHalted
    };
  }

  private updateSZP(val: number) {
    const v8 = val & 0xFF;
    this.flags.Z = v8 === 0;
    this.flags.S = (v8 & 0x80) !== 0;

    // Parity (even parity)
    let setBits = 0;
    for (let i = 0; i < 8; i++) {
      if ((v8 & (1 << i)) !== 0) setBits++;
    }
    this.flags.P = setBits % 2 === 0;
  }

  public getHLAddress(): number {
    return (this.H << 8) | this.L;
  }

  public setHLAddress(addr: number) {
    this.H = (addr >> 8) & 0xFF;
    this.L = addr & 0xFF;
  }

  public assemble(asm: string, startAddr: number = 0x0800): { errors: string[]; machineCode: { addr: number; bytes: number[]; line: string }[] } {
    const lines = asm.split('\n');
    const errors: string[] = [];
    const machineCode: { addr: number; bytes: number[]; line: string }[] = [];
    let currentAddr = startAddr;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const rawLine = lines[lineIndex].trim();
      const commentIdx = rawLine.indexOf(';');
      const line = (commentIdx !== -1 ? rawLine.substring(0, commentIdx) : rawLine).trim();
      if (!line) continue;

      const tokens = line.split(/[\s,]+/);
      const opcode = tokens[0].toUpperCase();

      try {
        const bytes: number[] = [];
        if (opcode === 'NOP') {
          bytes.push(0x00);
        } else if (opcode === 'HLT') {
          bytes.push(0x76);
        } else if (opcode === 'MVI') {
          const reg = tokens[1].toUpperCase();
          const val = parseInt(tokens[2], 16) & 0xFF;
          const map: { [r: string]: number } = { A: 0x3E, B: 0x06, C: 0x0E, D: 0x16, E: 0x1E, H: 0x26, L: 0x2E, M: 0x36 };
          if (map[reg] !== undefined) {
            bytes.push(map[reg], val);
          } else {
            errors.push(`Line ${lineIndex + 1}: Invalid register '${reg}'`);
          }
        } else if (opcode === 'MOV') {
          const dest = tokens[1].toUpperCase();
          const src = tokens[2].toUpperCase();
          const rMap: { [r: string]: number } = { B: 0, C: 1, D: 2, E: 3, H: 4, L: 5, M: 6, A: 7 };
          if (rMap[dest] !== undefined && rMap[src] !== undefined) {
            bytes.push(0x40 | (rMap[dest] << 3) | rMap[src]);
          } else {
            errors.push(`Line ${lineIndex + 1}: Invalid MOV syntax`);
          }
        } else if (opcode === 'LXI') {
          const pair = tokens[1].toUpperCase();
          const val16 = parseInt(tokens[2], 16) & 0xFFFF;
          const low = val16 & 0xFF;
          const high = (val16 >> 8) & 0xFF;
          const map: { [p: string]: number } = { B: 0x01, D: 0x11, H: 0x21, SP: 0x31 };
          if (map[pair] !== undefined) {
            bytes.push(map[pair], low, high);
          } else {
            errors.push(`Line ${lineIndex + 1}: Invalid register pair '${pair}'`);
          }
        } else if (opcode === 'LDA') {
          const addr = parseInt(tokens[1], 16) & 0xFFFF;
          bytes.push(0x3A, addr & 0xFF, (addr >> 8) & 0xFF);
        } else if (opcode === 'STA') {
          const addr = parseInt(tokens[1], 16) & 0xFFFF;
          bytes.push(0x32, addr & 0xFF, (addr >> 8) & 0xFF);
        } else if (opcode === 'ADD') {
          const reg = tokens[1].toUpperCase();
          const map: { [r: string]: number } = { B: 0x80, C: 0x81, D: 0x82, E: 0x83, H: 0x84, L: 0x85, M: 0x86, A: 0x87 };
          if (map[reg] !== undefined) bytes.push(map[reg]);
        } else if (opcode === 'SUB') {
          const reg = tokens[1].toUpperCase();
          const map: { [r: string]: number } = { B: 0x90, C: 0x91, D: 0x92, E: 0x93, H: 0x94, L: 0x95, M: 0x96, A: 0x97 };
          if (map[reg] !== undefined) bytes.push(map[reg]);
        } else if (opcode === 'INR') {
          const reg = tokens[1].toUpperCase();
          const map: { [r: string]: number } = { B: 0x04, C: 0x0C, D: 0x14, E: 0x1C, H: 0x24, L: 0x2C, M: 0x34, A: 0x3C };
          if (map[reg] !== undefined) bytes.push(map[reg]);
        } else if (opcode === 'DCR') {
          const reg = tokens[1].toUpperCase();
          const map: { [r: string]: number } = { B: 0x05, C: 0x0D, D: 0x15, E: 0x1D, H: 0x25, L: 0x2D, M: 0x35, A: 0x3D };
          if (map[reg] !== undefined) bytes.push(map[reg]);
        } else if (opcode === 'INX') {
          const pair = tokens[1].toUpperCase();
          const map: { [p: string]: number } = { B: 0x03, D: 0x13, H: 0x23, SP: 0x33 };
          if (map[pair] !== undefined) bytes.push(map[pair]);
        } else if (opcode === 'DCX') {
          const pair = tokens[1].toUpperCase();
          const map: { [p: string]: number } = { B: 0x0B, D: 0x1B, H: 0x2B, SP: 0x3B };
          if (map[pair] !== undefined) bytes.push(map[pair]);
        } else if (opcode === 'JMP') {
          const addr = parseInt(tokens[1], 16) & 0xFFFF;
          bytes.push(0xC3, addr & 0xFF, (addr >> 8) & 0xFF);
        } else if (opcode === 'JNZ') {
          const addr = parseInt(tokens[1], 16) & 0xFFFF;
          bytes.push(0xC2, addr & 0xFF, (addr >> 8) & 0xFF);
        } else if (opcode === 'JZ') {
          const addr = parseInt(tokens[1], 16) & 0xFFFF;
          bytes.push(0xCA, addr & 0xFF, (addr >> 8) & 0xFF);
        } else {
          // Fallback NOP
          bytes.push(0x00);
        }

        for (let b = 0; b < bytes.length; b++) {
          this.memory[currentAddr + b] = bytes[b];
        }

        machineCode.push({ addr: currentAddr, bytes, line: rawLine });
        currentAddr += bytes.length;
      } catch (err: any) {
        errors.push(`Line ${lineIndex + 1}: Syntax error`);
      }
    }

    this.PC = startAddr;
    return { errors, machineCode };
  }

  public step(): boolean {
    if (this.isHalted) return false;

    const op = this.memory[this.PC++];
    this.cycles += 4;

    switch (op) {
      case 0x00: // NOP
        break;
      case 0x76: // HLT
        this.isHalted = true;
        return false;

      // MVI r, d8
      case 0x3E: this.A = this.memory[this.PC++]; break;
      case 0x06: this.B = this.memory[this.PC++]; break;
      case 0x0E: this.C = this.memory[this.PC++]; break;
      case 0x16: this.D = this.memory[this.PC++]; break;
      case 0x1E: this.E = this.memory[this.PC++]; break;
      case 0x26: this.H = this.memory[this.PC++]; break;
      case 0x2E: this.L = this.memory[this.PC++]; break;
      case 0x36: this.memory[this.getHLAddress()] = this.memory[this.PC++]; break;

      // LXI
      case 0x01: this.C = this.memory[this.PC++]; this.B = this.memory[this.PC++]; break;
      case 0x11: this.E = this.memory[this.PC++]; this.D = this.memory[this.PC++]; break;
      case 0x21: this.L = this.memory[this.PC++]; this.H = this.memory[this.PC++]; break;
      case 0x31: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        this.SP = (high << 8) | low;
        break;
      }

      // LDA / STA
      case 0x3A: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        this.A = this.memory[(high << 8) | low];
        break;
      }
      case 0x32: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        this.memory[(high << 8) | low] = this.A;
        break;
      }

      // ADD
      case 0x87: this.A = (this.A + this.A) & 0xFF; this.updateSZP(this.A); break;
      case 0x80: this.A = (this.A + this.B) & 0xFF; this.updateSZP(this.A); break;
      case 0x81: this.A = (this.A + this.C) & 0xFF; this.updateSZP(this.A); break;
      case 0x82: this.A = (this.A + this.D) & 0xFF; this.updateSZP(this.A); break;
      case 0x83: this.A = (this.A + this.E) & 0xFF; this.updateSZP(this.A); break;
      case 0x84: this.A = (this.A + this.H) & 0xFF; this.updateSZP(this.A); break;
      case 0x85: this.A = (this.A + this.L) & 0xFF; this.updateSZP(this.A); break;
      case 0x86: this.A = (this.A + this.memory[this.getHLAddress()]) & 0xFF; this.updateSZP(this.A); break;

      // SUB
      case 0x90: this.A = (this.A - this.B) & 0xFF; this.updateSZP(this.A); break;
      case 0x91: this.A = (this.A - this.C) & 0xFF; this.updateSZP(this.A); break;
      case 0x96: this.A = (this.A - this.memory[this.getHLAddress()]) & 0xFF; this.updateSZP(this.A); break;

      // INR
      case 0x3C: this.A = (this.A + 1) & 0xFF; this.updateSZP(this.A); break;
      case 0x04: this.B = (this.B + 1) & 0xFF; this.updateSZP(this.B); break;
      case 0x0C: this.C = (this.C + 1) & 0xFF; this.updateSZP(this.C); break;
      case 0x14: this.D = (this.D + 1) & 0xFF; this.updateSZP(this.D); break;
      case 0x1C: this.E = (this.E + 1) & 0xFF; this.updateSZP(this.E); break;
      case 0x24: this.H = (this.H + 1) & 0xFF; this.updateSZP(this.H); break;
      case 0x2C: this.L = (this.L + 1) & 0xFF; this.updateSZP(this.L); break;

      // DCR
      case 0x3D: this.A = (this.A - 1) & 0xFF; this.updateSZP(this.A); break;
      case 0x05: this.B = (this.B - 1) & 0xFF; this.updateSZP(this.B); break;
      case 0x0D: this.C = (this.C - 1) & 0xFF; this.updateSZP(this.C); break;
      case 0x15: this.D = (this.D - 1) & 0xFF; this.updateSZP(this.D); break;
      case 0x1D: this.E = (this.E - 1) & 0xFF; this.updateSZP(this.E); break;

      // JMP / JNZ / JZ
      case 0xC3: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        this.PC = (high << 8) | low;
        break;
      }
      case 0xC2: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        if (!this.flags.Z) this.PC = (high << 8) | low;
        break;
      }
      case 0xCA: {
        const low = this.memory[this.PC++];
        const high = this.memory[this.PC++];
        if (this.flags.Z) this.PC = (high << 8) | low;
        break;
      }

      default:
        // Handle generic MOV dst, src
        if ((op & 0xC0) === 0x40) {
          const dst = (op >> 3) & 0x07;
          const src = op & 0x07;
          const getSrcVal = (s: number) => {
            switch (s) {
              case 0: return this.B;
              case 1: return this.C;
              case 2: return this.D;
              case 3: return this.E;
              case 4: return this.H;
              case 5: return this.L;
              case 6: return this.memory[this.getHLAddress()];
              case 7: return this.A;
              default: return 0;
            }
          };
          const val = getSrcVal(src);
          switch (dst) {
            case 0: this.B = val; break;
            case 1: this.C = val; break;
            case 2: this.D = val; break;
            case 3: this.E = val; break;
            case 4: this.H = val; break;
            case 5: this.L = val; break;
            case 6: this.memory[this.getHLAddress()] = val; break;
            case 7: this.A = val; break;
          }
        }
        break;
    }

    return true;
  }
}
