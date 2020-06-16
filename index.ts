import { exec } from "https://deno.land/x/execute/mod.ts";

async function getVersion() {
    const a = await import("https://deno.land/std/version.ts");

    console.log(a.VERSION);
}

function sanitizeText(text: string) {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function parseDepsTree(output: string) {
    const tree = output.split("\n")
        .reduce(
            (acc: { depsPassed: boolean, deps: string[] }, curr: string) => {
                const line = sanitizeText(curr);

                if (line === "deps:") {
                    return { ...acc, depsPassed: true };
                }

                if (!acc.depsPassed) {
                    return acc;
                }

                return { ...acc, deps: [ ...acc.deps, line ] };
            },
            { depsPassed: false, deps: [] },
        );

    return tree.deps;
}

async function getInfo(file: string) {
    const output = await exec(`deno info ${file}`);

    return parseDepsTree(output);
}

const info = await getInfo("index.ts");
console.log(info);
