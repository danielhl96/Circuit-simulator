# ⚡ Circuit Simulator

An interactive MOSFET simulator — built with **Angular 18**, **Tailwind CSS**, and **DaisyUI**, fully containerized with **Docker**.

---

## ✨ Features

- Interactive 2D cross-section visualization of N-channel and P-channel MOSFETs
- Real-time physics simulation: threshold voltage, drain current, transconductance, output resistance
- Body effect and channel-length modulation included
- Characteristic curves: transfer curve Id(Vgs) and output curve Id(Vds)
- Editable device parameters via modal dialog with input validation
- Component library panel with device cards (SVG symbols)

---

## 🗂 Project Structure

```
Circuit-simulator/
├── frontend/
│   ├── src/
│   │   ├── app/                        # Root component, routing
│   │   └── shared/
│   │       ├── mosfet/                 # MOSFET component + physics model
│   │       │   └── models/mosfet.ts   # Core physics engine
│   │       ├── characteristic-curves/ # ApexCharts wrapper
│   │       ├── devicecard/            # Library card component
│   │       ├── navbar/                # Top navigation
│   │       ├── button/                # Reusable button component
│   │       └── input/                 # Reusable input with validation
│   ├── public/                        # Static SVG device symbols
│   ├── Dockerfile                     # Multi-stage: dev → build → prod (nginx)
│   └── nginx.conf                     # SPA routing + caching + security headers
├── docker-compose.yml                 # Orchestration (dev + prod profiles)
├── Makefile                           # Shortcut commands
└── .env.example                       # Environment variables (ports)
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose v2

### Development (hot-reload)

```bash
cp .env.example .env
make dev
# or: docker compose up --build
```

Open → **http://localhost:4200**

### Production (nginx)

```bash
make prod
# or: docker compose --profile production up --build
```

Open → **http://localhost:8080**

---

## 📋 Makefile Commands

| Command           | Description                                  |
|-------------------|----------------------------------------------|
| `make dev`        | Start dev server (hot-reload, port 4200)     |
| `make prod`       | Start production server (nginx, port 8080)   |
| `make build`      | Build dev image                              |
| `make build-prod` | Build production image                       |
| `make down`       | Stop all containers                          |
| `make logs`       | Show container logs                          |
| `make clean`      | Remove containers, volumes and images        |

---

## 🛠 Tech Stack

| Layer            | Technology                                    |
|------------------|-----------------------------------------------|
| Framework        | Angular 18 — Standalone Components, Signals   |
| Styling          | Tailwind CSS 3 + DaisyUI 4                    |
| Charts           | ng-apexcharts                                 |
| Build            | esbuild / Angular CLI                         |
| Dev Server       | `ng serve` in Docker (port 4200)              |
| Prod Server      | nginx stable-alpine (port 8080)               |
| Containerization | Docker multi-stage builds                     |

---

## 🏗 Architecture

The application follows Angular's **standalone component** architecture with reactive state managed via **Signals**.

```
AppComponent
├── NavbarComponent                       – theme toggle, library toggle event
├── DeviceCardComponent[]                 – library panel, emits add()
└── MosfetComponent                       – main device view
    ├── Mosfet (class)                    – physics model, signal-based state
    ├── CharacteristicCurvesComponent x2  – ApexCharts wrappers
    ├── ButtonComponent                   – reusable button with loading/disabled state
    └── InputComponent                    – reusable input with error emission
```

### State Management

Each `Mosfet` instance holds its complete state in an Angular `signal({...})`.
All derived quantities (Cox, Vth, Id, gm, ro, lambda) are computed synchronously
inside `state.update()` in a physically correct dependency order:

```
Cox → Vth → Id₀ → λ → Id (final) → gm → ro → L_eff
```

Parameter changes from the UI flow via `@Output() propertyChange` to the parent,
which calls `mosfet.state.update()` followed by `mosfet.update()`.

---

## ⚛ Physical Model

The simulator implements a **long-channel MOSFET model** (Level 1 / Shichman-Hodges)
extended with body effect and channel-length modulation.

### Oxide Capacitance

```
Cox = eps_ox / t_ox
```

### Threshold Voltage (with body effect)

```
Vth = Vfb + 2*phi_F + sqrt(2 * q * eps_s * Na * (2*phi_F + Vsb)) / Cox
```

Fermi potential:
```
phi_F = Vt * ln(Na / ni)
```

### Drain Current

**Cut-off** (Vgs <= Vth):  `Id = 0`

**Linear / Triode** (Vds < Vgs - Vth):
```
Id = kn * [(Vgs - Vth) * Vds - Vds² / 2]
```

**Saturation** (Vds >= Vgs - Vth):
```
Id = (kn / 2) * (Vgs - Vth)² * (1 + lambda * Vds)
```

Process transconductance parameter:
```
kn = mu_n * Cox * (W / L)
```

### Transconductance

```
gm = mu_n * Cox * (W / L) * (Vgs - Vth)
```

### Output Resistance

```
ro = 1 / (lambda * Id)
```

### Channel-Length Modulation

```
lambda = 1 / (L * sqrt(Id0))
L_eff  = L / (1 + lambda * (Vds - Vds_sat))
```

### P-Channel

All equations apply symmetrically with sign inversion: Vth < 0, Vgs < 0, Vds < 0.
The substrate doping term uses Nd instead of Na.

### Constants used

| Symbol | Value         | Description                            |
|--------|---------------|----------------------------------------|
| mu_n   | 0.05 m²/Vs    | Electron mobility                      |
| eps_0  | 8.854e-14 F/cm| Electric constant                      |
| eps_r  | 11.7          | Relative permittivity of silicon       |
| ni     | 1.5e10 cm⁻³   | Intrinsic carrier concentration (300K) |
| q      | 1.602e-19 C   | Elementary charge                      |

---

## 📄 License

MIT
