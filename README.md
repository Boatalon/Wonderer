---
title: Protein Generation
emoji: 🧬
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.44.1
app_file: app.py
pinned: false
python_version: "3.10"
---

# 🧬 Wonderer — De Novo Protein Generation Demo

An interactive **De Novo Protein Backbone Generation** web application developed by the **Wonderer** team for the Deep Learning course. This project combines **RFdiffusion**-style generative modeling with an **SE(3)-Equivariant Transformer** (`SE3Transformer`) and an interactive **Gradio** web interface.

---

## ✨ Key Features

- **Diffusion-Based Protein Design**: Generates 3D protein backbone structures via iterative denoising.
- **SE(3)-Equivariant Attention (`env/SE3Transformer`)**: Preserves 3D rotational and translational equivariance across molecular coordinates.
- **Configurable Inference Presets (`config/inference/`)**:
  - `base.yaml` — Standard unconditional and conditional protein generation settings.
  - `symmetry.yaml` — Symmetric oligomer generation configurations.
- **Interactive Gradio Web UI (`app.py`)**: Browser-based control panel ready for local execution, Docker deployment, or Hugging Face Spaces.

---

## 📁 Project Structure

```text
Wonderer/
├── app.py                          # Main Gradio web application
├── config/
│   └── inference/
│       ├── base.yaml               # Default inference hyperparameters
│       └── symmetry.yaml           # Symmetry-constrained generation config
├── docker/
│   └── Dockerfile                  # Containerized environment definition
└── env/
    └── SE3Transformer/             # SE(3)-Transformer equivariant neural network package
```

---

## 🚀 Getting Started

```bash
# 1. Install the SE(3)-Transformer module and dependencies
cd env/SE3Transformer
pip install -r requirements.txt
python setup.py install
cd ../..

# 2. Launch the Gradio web interface
python app.py
```
