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

    result = subprocess.run(cmd, capture_output=True, text=True)

    pdb_file = f"{output_prefix}_0.pdb"

    if os.path.exists(pdb_file):
        viewer_html = render_3d(pdb_file)
        return "Done", viewer_html
    else:
        return "Generation failed\n" + result.stderr, ""


def render_3d(pdb_path):
    with open(pdb_path, "r") as f:
        pdb_data = f.read()

    viewer_id = uuid.uuid4().hex
    viewer_file = f"static/viewer_{viewer_id}.html"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
<script src="https://3dmol.org/build/3Dmol-min.js"></script>
</head>
<body style="margin:0; background:black;">
<div id="viewer" style="width:100%; height:500px;"></div>
<script>
let viewer = $3Dmol.createViewer("viewer", {{ backgroundColor: "black" }});
let pdbData = `{pdb_data.replace("`", "")}`;
viewer.addModel(pdbData, "pdb");
viewer.setStyle({{}}, {{cartoon: {{color: "spectrum"}}}});
viewer.zoomTo();
viewer.render();
</script>
</body>
</html>
"""

    with open(viewer_file, "w") as f:
        f.write(html_content)

    return f'<iframe src="/file={viewer_file}" width="100%" height="520px" frameborder="0"></iframe>'


with gr.Blocks() as demo:
    gr.Markdown("## 🧬 RFdiffusion Protein Generator")

    length = gr.Number(value=150, label="Protein Length", precision=0)
    generate_btn = gr.Button("Generate")

    status = gr.Textbox(label="Status")
    viewer = gr.HTML()

    generate_btn.click(
        generate_protein,
        inputs=length,
        outputs=[status, viewer],
    )

demo.launch(server_name="0.0.0.0", server_port=7860)
