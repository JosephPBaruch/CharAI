# Documentation README

## Drawio

**Download this extension:**

    Name: Draw.io Integration
    Id: hediet.vscode-drawio

## Commiting with git lfs

```bash
# install LFS (once per machine)
git lfs install

# start tracking PDFs
git lfs track "*.pdf"
echo "*.pdf filter=lfs diff=lfs merge=lfs -text" >> .gitattributes

# re-add the PDFs so LFS makes pointers
git add .gitattributes
git add path/to/*.pdf
git commit -m "Track PDFs with Git LFS"
git push

```