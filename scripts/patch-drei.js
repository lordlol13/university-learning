import fs from "node:fs";
import path from "node:path";

function patchFile(filePath, search, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  if (content.includes(search)) {
    fs.writeFileSync(filePath, content.replace(search, replacement), "utf-8");
    console.log(`[patch-drei] Patched ${path.basename(filePath)} for React 19 root unmount safety.`);
  }
}

const htmlJs = path.join(process.cwd(), "node_modules/@react-three/drei/web/Html.js");
const htmlCjs = path.join(process.cwd(), "node_modules/@react-three/drei/web/Html.cjs.js");

patchFile(
  htmlJs,
  `      return () => {\n        if (target) target.removeChild(el);\n        currentRoot.unmount();\n      };`,
  `      return () => {\n        setTimeout(() => {\n          try {\n            if (target && target.contains(el)) target.removeChild(el);\n            currentRoot.unmount();\n          } catch {}\n        }, 0);\n      };`
);

patchFile(
  htmlCjs,
  `return U&&(s?U.prepend(D):U.appendChild(D)),()=>{U&&U.removeChild(D),e.unmount()}`,
  `return U&&(s?U.prepend(D):U.appendChild(D)),()=>{setTimeout((function(){try{U&&U.contains(D)&&U.removeChild(D),e.unmount()}catch(err){}}),0)}`
);
