import { workspace, Uri } from 'vscode';
const EDGE: string = "└──";
const VERTICAL: string = "│";
const MIDDLE_ITEM: string = "├──";
const DIRECTORY_ICON: string = "📁";
const FILE_ICON: string = "📄";

export default async function generateTree(path: string, deep: number = 0, exceptions: string[] = []): Promise<string> {
    let strTree: string = "";
    let sep = "";

    // Add current dir name
    let tempSplit = path.split("/");
    let name = tempSplit[tempSplit.length-1];

    // Search all files and sub dirs inside 
    let dirContent = await workspace.fs.readDirectory(Uri.parse(path));	
    // We separated folders and files
    let listFiles = dirContent.filter((fileObj) => fileObj[1] === 1);
    let subDirs =  dirContent.filter((fileObj) => fileObj[1] === 2).map((item) => [item[0], deep+1]);
    //subDirs.push([name, deep]);
    let filesPrinted = false;
    let pathFound = true;
    let currentDir = null;

    strTree += `${MIDDLE_ITEM}${DIRECTORY_ICON} ${name}\n`;
    
    // We use a stack to save all directories and iterate 
    while(subDirs.length) {
        if (pathFound) {currentDir = subDirs.pop();}
        if (currentDir && currentDir.length && !exceptions.includes(currentDir[0] as string)) {
            let currentDeep = currentDir[1] as number;
            if (!filesPrinted) {
                listFiles.forEach((file) => {
                    sep = `${VERTICAL}\t`.repeat(currentDeep);
                    strTree += `${sep}${MIDDLE_ITEM}${FILE_ICON} ${file[0]}\n`;
                });
            }
            sep = `${VERTICAL}\t`.repeat(currentDeep);
            strTree += pathFound ? `${sep}${MIDDLE_ITEM}${DIRECTORY_ICON} ${currentDir[0]}\n` : '';
            path += '/'+currentDir[0];
            listFiles = [];
            filesPrinted = false;
            try {
                let tempContent = await workspace.fs.readDirectory(Uri.parse(path));
                if (tempContent.length) {
                    pathFound = true;
                    let tempSubDirs = tempContent.filter((obj) => obj[1] === 2).map((item) => [item[0], currentDeep+1]);
                    listFiles = tempContent.filter((file) => file[1] === 1); 
                    if (!tempSubDirs.length) {
                        sep = `${VERTICAL}\t`.repeat(currentDeep+1);
                        listFiles.forEach((file) => {
                            strTree += `${sep}${MIDDLE_ITEM}${FILE_ICON} ${file[0]}\n`;
                        });
                        tempSplit = path.split("/");
                        tempSplit.pop();
                        path = tempSplit.join("/");
                        deep = currentDeep-1;
                        filesPrinted = true;
                    } else {
                        subDirs = subDirs.concat(tempSubDirs);
                        deep = currentDeep+1;
                    }

                } else {
                    deep = currentDeep-1;
                }
            } catch (error) {
                pathFound = false;
                deep = currentDeep-1 < 0 ? 0 : currentDeep-1;
                tempSplit = path.split("/");
                tempSplit.pop();
                tempSplit.pop();
                path = tempSplit.join("/");
            }
        }

    }
    return strTree;
}