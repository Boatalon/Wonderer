import os
import subprocess
import gradio as gr
import uuid

os.makedirs("static", exist_ok=True)
os.makedirs("ui_outputs", exist_ok=True)


def generate_protein(length):
    output_prefix = f"ui_outputs/test_{uuid.uuid4().hex[:6]}"
    contig = f"[{int(length)}-{int(length)}]"

    cmd = [
        "python",
        "./scripts/run_inference.py",
        f"contigmap.contigs={contig}",
        f"inference.output_prefix={output_prefix}",
        "inference.num_designs=1",
    ]

    env = os.environ.copy()
    env["PYTHONPATH"] = f"{os.getcwd()}:{os.getcwd()}/env/SE3Transformer:{env.get('PYTHONPATH', '')}"
    
    result = subprocess.run(cmd, capture_output=True, text=True, env=env)

    pdb_file = f"{output_prefix}_0.pdb"

    if os.path.exists(pdb_file):
        with open(pdb_file, "r") as f:
            pdb_data = f.read()
        return "Done", pdb_data
    else:
        return f"Generation failed\n{result.stderr}", ""


with gr.Blocks() as demo:
    gr.Markdown("## 🧬 RFdiffusion Protein Generator")

    length = gr.Number(value=150, label="Protein Length", precision=0)
    generate_btn = gr.Button("Generate")

    status = gr.Textbox(label="Status")
    viewer_data = gr.Textbox(label="PDB Data (Hidden for API)", visible=False)

    generate_btn.click(
        generate_protein,
        inputs=length,
        outputs=[status, viewer_data],
        api_name="predict"
    )

demo.launch(server_name="0.0.0.0", server_port=7860)
