
function File(name, id, type, content, parentId){
    this._fileName = name;
    this._id = id;
    this._type = type;
    this._content = content;
    this._childrens = [];
    this._parent = parentId;
}


startProgram();




function startProgram(){
    var globalArguments = initializeGlobalArguments();

    if (isExistFileSystemText(globalArguments.dataFile)) {
        readFileSystem(globalArguments);
        if (globalArguments.isReadFileSystemError){
            askingUserForInstallation(globalArguments);
        }
    } else {
        console.log("System file \'file_system.txt\' are missing.\n");
        askingUserForInstallation(globalArguments);
    }

    while(!globalArguments.quit){
        showUserInterface(globalArguments);
    }
}


function askingUserForInstallation(object){
    const readSync = require("readline-sync");
    object.output = 'Do you want to install a new system ? [Y/N]: ';
    var wantInstallation = true;
    while(wantInstallation) {
        object.input = readSync.question(object.output);
        if (wordCount(object.input) === 1) {
            if (object.input.toLowerCase() === 'y' || object.input.toLowerCase() === 'yes'){
                object.root = new File('root', object.id, 'directory', '', -1);
                wantInstallation = false;
            } else if (object.input.toLowerCase() === 'n' || object.input.toLowerCase() === 'no'){
                wantInstallation = false;
            }
        } else {
            console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
        }
    }
}

function isExistFileSystemText(fileSystem){
    const fs = require('fs');
    if (fs.existsSync(__dirname +"/"+ fileSystem)) {
        return true;
    }
    return false;
}


function readFileSystem(object){
    /*
     1. File is empty --> cant upload system with this file [V]
     2. File is not contain linear array in his data --> cant upload system with this file [V]
     3. File contain root folder (id:0)  --> cant upload the system with this file [V]
     4.1 Each object parent id is largest from his id --> upload the system without those files [V]
     4.2 Each object has name, id, type and parent --> upload the system without those files [V]
     */
    const readSync = require("readline-sync");
    var fileHandleError = {
        isCriticalError: false,
        isMinorError: false,
        message: ''
    };
    var linearArray = getLinearArrayFromFile(object.dataFile);
    validateLinearArray(linearArray, fileHandleError, object);
    if (!fileHandleError.isCriticalError){
        validateRoot(linearArray, fileHandleError);
        if (!fileHandleError.isCriticalError){
            linearArray = validateEachObjectInLinearArray(linearArray, fileHandleError);
        }
    }

    if (!fileHandleError.isCriticalError){
        if (fileHandleError.isMinorError) {
            console.log(object.colors.bgBlue("Notice:")+" "+fileHandleError.message + "\n");

            object.output = 'Do you want to upload the system without damaged files? [Y/N]: ';
            var askForReloadSystemFile = true;
            while(askForReloadSystemFile) {
                object.input = readSync.question(object.output);
                if (wordCount(object.input) === 1) {
                    if (object.input.toLowerCase() === 'y' || object.input.toLowerCase() === 'yes'){
                        askForReloadSystemFile = false;
                        object.address = 'root';
                        object.currentID =  0;
                        object.output = 'root>';
                        convertFromLinearArrayToGraph(linearArray, object);
                    } else if (object.input.toLowerCase() === 'n' || object.input.toLowerCase() === 'no'){
                        object.isReadFileSystemError = true;
                        askForReloadSystemFile = false;
                    }
                } else {
                    console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
                }
            }
        } else {
            object.address = 'root';
            object.currentID =  0;
            object.output = 'root>';
            convertFromLinearArrayToGraph(linearArray, object);
        }
    } else {
        object.isReadFileSystemError = true;
        console.log(object.colors.bgRed("Error:")+" "+fileHandleError.message+"\n");
    }
}

function validateLinearArray(array, errorObject, object){
    if (!Array.isArray(array)){
        errorObject.isCriticalError = true;
        errorObject.message += "Data file \'"+object.dataFile+"\' is not contain array of objects\n";
    }
}

function validateRoot(array, errorObject){
    var isFound = false;
    var index = 0;
    while (!isFound && index<array.length){
        if (array[index]._id === 0){
            isFound = true;
            if (array[index]._fileName === '' || array[index]._type !== 'directory' || array[index]._parent > 0){
                errorObject.isCriticalError = true;
                errorObject.message += "Root is not validate, file system cannot be upload\n";
            }
        }
        index++;
    }
    if (!isFound){
        errorObject.isCriticalError = true;
        errorObject.message += "Root is missing in the file system, file system cannot be upload\n ";
    }

}


function validateEachObjectInLinearArray(array, errorObject){
    var intArray = [0];
    for (var i=1; i<array.length; i++){
        if (isObjectValidate(array[i])){
            if (intArray.includes(array[i]._parent)){
                intArray.push(array[i]._id);
            }
        } else {
            errorObject.isMinorError = true;
            if (array[i]._fileName !== undefined && array[i]._fileName !== ''){
                errorObject.message += "\'"+array[i]._fileName+ "\' is damaged and cannot be uploaded\n";
            } else {
                errorObject.message += "some object is damaged and cannot be uploaded\n";
            }
        }
    }

    var newArray = [];
    for (var i=0; i<array.length; i++){
        if (intArray.includes(array[i]._id)){
            newArray.push(array[i]);
            for (var j=0; j<array[i]._childrens.length; j++){
                if (!intArray.includes(array[i]._childrens[j]._id)){
                    array[i]._childrens.splice(j, 1);
                    j--;
                }
            }
        } else {
        }
    }
    return newArray;
}



function isObjectValidate(object){
    if (object._id < 0 || object._id === null || object._id === '' || isNaN(object._id )){
        return false;
    }
    if (object._fileName === undefined || object._fileName === null || object._fileName === ''){
        return false;
    }
    if (object._type === undefined || object._type === null || (object._type !== 'directory' && object._childrens.length > 0) || object._type === ''){
        return false;
    }
    if (object._parent < 0 || object._parent === null || object._parent === '' || isNaN(object._parent ) || object._parent > object._id){
        return false;
    }
    if (object._childrens === undefined || isNaN(object._childrens.length)){
        return false;
    }
    return true;
}




function addFolderChildToFile(file, folderName, object){
    object.id++;
    file._childrens.push(new File(folderName, object.id, 'directory', '', file._id));
    return file._childrens[file._childrens.length-1];
}


function addFileChildToFile(file, fileName, type, content, object){
    object.id++;
    file._childrens.push(new File(fileName, object.id, type, content, file._id));
    return file._childrens[file._childrens.length-1];
}




function initializeGlobalArguments() {
    var newObject = {
        colors: require('colors'),
        id: 0,
        isReadFileSystemError: false,
        dataFile: 'file_system.txt',
        quit: false,
        wantQuit: false,
        isFirstTime: true,
        address: 'root',
        currentID:  0,
        input: '',
        root: null,
        output: 'root>\t',
        help: [
            ['cd', 'Change current directory', 'Usage: cd [folder-name]'],
            ['dir', 'Print current directory', 'Usage: dir'],
            ['echo', 'Write text into file', 'Usage: echo [file-name] [content]'],
            ['export', 'Export current file system to text file', 'Usage: export [text file-name]'],
            ['help', 'Print all commands or usage for specific command', 'Usage: help [optional: command]'],
            ['import', 'Import file system from text file', 'Usage: import [text file-name]'],
            ['md', 'Create new folder', 'Usage: md [folder-name]'],
            ['mf', 'Create new file', 'Usage: mf [file-name] [optional: content]'],
            ['open', 'Open file', 'Usage: open [file-name]'],
            ['rd', 'Remove directory', 'Usage: rd [folder-name]'],
            ['rf', 'Remove file', 'Usage: rf [file-name]'],
            ['/s', 'Searching for files', 'Usage: /s [folder/file-name]'],
            ['quit', 'Quit', 'Usage: quit'],
        ]

    };

    return newObject;
}


function showUserInterface(object){
    const readSync = require("readline-sync");
    if (object.isFirstTime){
        object.isFirstTime = false;
        printHelpCommands(object.help);
    } else {
        object.input = readSync.question(object.address+'>\t').toLowerCase();
        handleUserInput(object);
        object.output = object.address+'>\t';
    }
}

function printHelpCommands(help){
    console.log("<help> commands list: ");
    for (var i=0; i<help.length; i++){
        console.log(help[i][0]+"\t\t"+help[i][1]);
    }
    console.log("\n");
}


function handleUserInput(object){
    switch(getWord(object.input, 1)){
        case 'help':
          runHelpCommand(object);
            break;

        case 'dir':
           runDirCommand(object);
            break;

        case 'cd':
            runCdCommand(object);
            break;

        case 'cd..':
            object.input = "cd ..";
            runCdCommand(object);
            break;

        case 'md':
            runMdCommand(object);
            break;

        case 'mf':
            runMfCommand(object);
            break;

        case 'rd':
            runRdCommand(object);
            break;

        case 'rf':
            runRfCommand(object);
            break;

        case 'open':
            runOpenCommand(object);
            break;

        case 'echo':
            runEchoCommand(object);
            break;

        case '/s':
            runSearchCommand(object);
            break;

        case 'quit':
           runQuitCommand(object);
            break;

        case '':
            break;

        case 'debug':
            runDebugCommand(object);
            break;

        case 'export':
            runExportCommand(object);
            break;

        case 'import':
            runImportCommand(object);
            break;

        case 'id':
            console.log("object.id = "+object.id+"\n");
            break;

        default:
            console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
            break;
    }
}


function getWord(str, index) {
    var words = str.split(' ');
    return words[index-1];
}


function wordCount(str) {
    return str.split(" ").length;
}


function runHelpCommand(object){
    if (wordCount(object.input) === 1) {
        printHelpCommands(object.help);
    } else if (wordCount(object.input) === 2) {
        if (searchWordInHelp(getWord(object.input, 2), object.help)){
            printUsageHelp(getWord(object.input, 2), object.help);
        } else {
            console.log(object.colors.bgRed("Error:") + "Command \'"+getWord(input, 2)+"\' is not Exist"+"\n")
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}

function runDirCommand(object){
    if (wordCount(object.input) === 1) {
        printDir(object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runCdCommand(object){
    if (wordCount(object.input) === 2) {
        changeDir(getWord(object.input, 2), object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}

function runMdCommand(object){
    if (wordCount(object.input) === 2) {
       createNewFolder(object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}

function runMfCommand(object){
    var fileName = getWord(object.input, 2);
    var currentFolder = findFolderByID(object.root, object.currentID);
    if (isValidFileName(fileName)){
        if (wordCount(object.input) === 2) {
            addFileChildToFile(currentFolder,fileName,getTypeOfFile(fileName),'empty_file',object);
            console.log(fileName+" was created\n");
        } else if (wordCount(object.input) >= 3){
            addFileChildToFile(currentFolder,fileName,getTypeOfFile(fileName),getContent(object.input),object);
            console.log(fileName+" was created\n");
        } else {
            console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' is not valid name for file\n");
    }

}

function runRfCommand(object){
    if (wordCount(object.input) === 2) {
        deleteFile(getWord(object.input, 2), object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runRdCommand(object){
    if (wordCount(object.input) === 2) {
        checkDeleteFolder(getWord(object.input, 2), object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runQuitCommand(object){
    const readSync = require("readline-sync");
    if (wordCount(object.input) === 1){
        object.output = 'Are you sure? [Y/N]: ';
        object.wantQuit = true;
        while(object.wantQuit) {
            object.input = readSync.question(object.output);
            if (wordCount(object.input) === 1) {
                if (object.input.toLowerCase() === 'y' || object.input.toLowerCase() === 'yes'){
                    object.wantQuit = false;
                    object.quit = true;
                } else if (object.input.toLowerCase() === 'n' || object.input.toLowerCase() === 'no'){
                    object.wantQuit = false;
                }
            } else {
                console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
            }
        }
    }
}


function runOpenCommand(object){
    if (wordCount(object.input) === 2) {
        openFile(getWord(object.input, 2), object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runEchoCommand(object){
    if (wordCount(object.input) >= 3) {
        writeToFile(getWord(object.input, 2), getContent(object.input), object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runDebugCommand(object){
    if (wordCount(object.input) === 2) {
        printFileObject(getWord(object.input, 2), object);
    } else if (wordCount(object.input) === 1) {
        console.log(object.root);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }

}


function runSearchCommand(object){
    if (wordCount(object.input) === 2) {
        if (getWord(object.input, 2).length > 2){
            startSearching(getWord(object.input, 2), object);
        } else {
            console.log(object.colors.bgRed("Error:") + " Search string must to be at least 3 characters"+"\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runExportCommand(object){
    if (wordCount(object.input) === 2) {
        var linearArray = convertFromGraphToLinearArray(object);
        var fileName = getWord(object.input, 2);
        if(fileName.includes('.txt')){
            insertLinearArrayToFile(fileName,linearArray);
            console.log("File system successfully exported to file: \'"+fileName+"\'\n");
        } else {
            insertLinearArrayToFile(fileName+".txt",linearArray);
            console.log("File system successfully exported to file: \'"+fileName+".txt\'\n");
        }

    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
}


function runImportCommand(object){
    if (wordCount(object.input) === 2) {
        var fileName = getWord(object.input, 2);
        if(!fileName.includes('.txt')) {
            fileName += '.txt'
        }
        object.dataFile = fileName;
        if (isExistFileSystemText(fileName)){
            readFileSystem(object);
            if (!object.isReadFileSystemError){
                console.log("File system successfully imported from file: \'"+fileName+"\'\n");
            }
        } else {
            console.log(object.colors.bgRed("Error:") + "\'"+fileName+"\' are missing"+"\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid command"+"\n");
    }
    object.isReadFileSystemError = false;
}






function startSearching(fileToSearch, object){
    var result = [];
    var root = object.root;
    searchInNameOfFiles(fileToSearch, result, root);
    searchInContentOfFiles(fileToSearch, result, root);
    if (result.length > 0){
        result = mergeSort(result, 'score');
        printSearchResult(result, root, fileToSearch);
    } else {
        console.log("No results for current search string"+"\n");
    }
}


function searchInNameOfFiles(str, result, file){
    if (removeFileTypeFromName(file._fileName) === str){
        if (file._type === 'directory'){
            result.push({id: file._id, score: 20, name: file._fileName})
        } else {
            result.push({id: file._id, score: 15, name: file._fileName})
        }

    } else if (file._fileName.includes(str)){
        result.push({id: file._id, score: 3, name: file._fileName})
    }
    for (var i=0; i<file._childrens.length; i++){
        searchInNameOfFiles(str, result, file._childrens[i]);
    }
}

function removeFileTypeFromName(string){
    if (string.includes('.')){
        return string.slice(0,string.indexOf('.'));
    } else {
        return string;
    }
}

function searchInContentOfFiles(str, result, file) {
    if (file._type !== 'directory') {
        var indexOfFile = -1;
        if (file._content === str){
            indexOfFile = getIndexFromArray(result, file._id);
            if (indexOfFile > -1){
                result[indexOfFile].score += 8;
            } else {
                result.push({id: file._id, score: 0, name: file._fileName});
                result[result.length-1].score = 8;
            }
        } else if (file._content.includes(str)) {
            var count = occurrencesInContent(file._content, str);
            indexOfFile = getIndexFromArray(result, file._id);
            if (indexOfFile > -1){
                result[indexOfFile].score += count;
            } else {
                result.push({id: file._id, score: 0, name: file._fileName});
                result[result.length-1].score = count;
            }
        }
    } else {
        for (var i = 0; i < file._childrens.length; i++) {
            searchInContentOfFiles(str, result, file._childrens[i]);
        }
    }
}


function printSearchResult(array, root, fileToSearch){
    var path = [];
    console.log("Search results :");
    for (var i=0; i<array.length; i++){
        getPathOfFile(root, array[i].id, path);
        printPath(path, fileToSearch);
        path = [];
    }
    console.log("\n");
}


function printPath(array, fileToSearch){
    var path = array[0];
    var str = "";
    for (var i=1; i<array.length; i++){
        if (i < array.length-1){
            path += "/"+array[i];
        } else {
            if (array[i].indexOf(fileToSearch) > -1){
                path += '/';
                path += array[i].slice(0,array[i].indexOf(fileToSearch));
                str = array[i].slice(array[i].indexOf(fileToSearch),fileToSearch.length+array[i].indexOf(fileToSearch));
                str = '\x1b[32m'+str+'\x1b[0m';
                path += str;
                path += array[i].slice(array[i].indexOf(fileToSearch)+fileToSearch.length);
            } else {
                path += "/"+array[i];
            }

        }

    }
    console.log("\t"+path);
}

function writeToFile(fileName, content, object) {
    var currentFile = findFolderByID(object.root, object.currentID);
    if (isFileExist(fileName, currentFile)) {
        if (!isFolder(fileName, currentFile)) {
            changeContentOfFileTo(fileName, content, currentFile);
        } else {
            console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' is not a file\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' isn\'t exist\n");
    }
}


function openFile(fileName, object) {
    var currentFile = findFolderByID(object.root, object.currentID);
    if (isFileExist(fileName, currentFile)) {
        if (!isFolder(fileName, currentFile)) {
            printFile(fileName, currentFile);
        } else {
            console.log(object.colors.bgRed("Error:") + " \'" + " could not open \'" + fileName + "\' (try cd command)\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' file isn\'t exist\n");
    }
}

function checkDeleteFolder(folderName, object) {
    var currentFolder = findFolderByID(object.root, object.currentID);
    if (isFileExist(folderName, currentFolder)) {
        if (isFolder(folderName, currentFolder)) {
            var folderToDelete = getFolderToDelete(folderName, currentFolder);
            deleteFolder(folderToDelete, object);
            console.log("\n");
        } else {
            console.log(object.colors.bgRed("Error:") + " \'" + folderName + "\' is not a directory\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + folderName + "\' isn\'t exist\n");
    }
}


function deleteFolder(folderToDelete, object) {
    var currentFile = null;
    var childrenArray = cloneArray(folderToDelete._childrens);
    while (childrenArray.length > 0) {
        currentFile = childrenArray.pop();
        if (currentFile._type === 'directory') {
            deleteFolder(currentFile, object);
        } else {
            removeFile(currentFile._fileName, folderToDelete);
        }
    }
    console.log("\'" + folderToDelete._fileName + "\' was deleted");
    var currentFolder = findFolderByID(object.root, object.currentID);
    removeFolderFrom(folderToDelete, currentFolder);
}


function deleteFile(fileName, object) {
    var currentFolder = findFolderByID(object.root, object.currentID);
    if (isFileExist(fileName, currentFolder)) {
        if (!isFolder(fileName, currentFolder)) {
            removeFile(fileName, currentFolder);
        } else {
            console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' is not a file\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' isn\'t exist\n");
    }
}

function removeFolderFrom(fileToRemove, currentLocation) {
    for (var i = 0; i < currentLocation._childrens.length; i++) {
        if (currentLocation._childrens[i] === fileToRemove) {
            currentLocation._childrens.splice(i, 1);
        }
    }
}


function removeFile(name, file) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            file._childrens.splice(i, 1);
            console.log("\'" + name + "\' was deleted");
        }
    }
}


function isValidFileName(fileName) {
    if (fileName.indexOf(".") > -1) {
        var isValid = true;
        var count = 0;
        var i = 0;
        while (isValid && i < fileName.length) {
            if (fileName.charAt(i) === '.') {
                count++;
                if (count > 1) {
                    isValid = false;
                    return false;
                }
            }
            i++;
        }
        return true;
    }
    return false;
}

function getTypeOfFile(file) {
    return file.substr(file.indexOf(".") + 1);
}


function changeDir(folderName, object) {
    if (object.currentID > 0 && folderName === '..') {
        goToBackDir(object);
        printDir(object);
        return;
    }
    var currentDir = findFolderByID(object.root, object.currentID);
    var dirToMove = findFolderByName(currentDir, folderName);
    if (dirToMove !== undefined && isFatherOf(currentDir, dirToMove)) {
        object.currentID = dirToMove._id;
        object.address += '\\' + dirToMove._fileName;
        printDir(object);
    } else {
        console.log(object.colors.bgRed("Error:") + " Invalid location: " + "\'" + folderName + "\'\n");
    }
}

function createNewFolder(object) {
    var fileName = getWord(object.input, 2);
    var currentFolder = findFolderByID(object.root, object.currentID);
    if (fileName.indexOf(".") === -1) {
        if (!isFileExist(fileName, currentFolder)) {
            addFolderChildToFile(currentFolder, fileName, object);
            console.log(fileName + " was created\n");
        } else {
            console.log(object.colors.bgRed("Error:") + " folder name \'" + fileName + "\' exist\n");
        }
    } else {
        console.log(object.colors.bgRed("Error:") + " \'" + fileName + "\' is not valid name for directory\n");
    }


}

function goToBackDir(object) {
    var currentFile = findFolderByID(object.root, object.currentID);
    object.address = object.address.substr(0, object.address.length - currentFile._fileName.length - 1);
    object.currentID = findFatherFolderByID(object.root, object.currentID)._id;
}


function printDir(object) {
    var folders = [];
    var files = [];
    var currentFolder = findFolderByID(object.root, object.currentID);
    console.log("  " + currentFolder._fileName + ':');
    if (currentFolder._id > 0) {
        console.log('     ..');
    }
    for (var i = 0; i < currentFolder._childrens.length; i++) {
        if (currentFolder._childrens[i]._type === 'directory') {
            folders.push(currentFolder._childrens[i]._fileName);
        } else {
            files.push(currentFolder._childrens[i]._fileName);
        }
    }

    if ((folders.length > 0) || (files.length > 0)) {
        folders.sort();
        files.sort();
        for (var i = 0; i < folders.length; i++) {
            console.log('     -' + folders[i]);
        }
        for (var i = 0; i < files.length; i++) {
            console.log('     -' + files[i]);
        }
        console.log("\n  " + folders.length + " folders(s) and " + files.length + " file(s) were found");
        console.log("\n");
    } else {
        console.log('\x1b[32m', '    -Empty', '\x1b[0m');
        console.log("\n");
    }
}


function searchWordInHelp(str, help) {
    var isExist = false;
    for (var i = 0; i < help.length; i++) {
        if (help[i][0] === str) {
            isExist = true;
            break;
        }
    }
    return isExist;
}

function printUsageHelp(str, help) {
    for (var i = 0; i < help.length; i++) {
        if (help[i][0] === str) {
            console.log('\x1b[36m', help[i][2], '\x1b[0m');
            console.log("\n");
            break;
        }
    }
}

function findFolderByID(file, id) {
    var isFound = false;
    var i = 0;
    var result = undefined;
    if (file._id === id) {
        return file;
    } else {
        while (!isFound && i < file._childrens.length) {
            if (file._childrens[i]._type === 'directory') {
                if (file._childrens[i]._id === id) {
                    isFound = true;
                    return file._childrens[i];
                } else {
                    result = findFolderByID(file._childrens[i], id);
                    if (result !== undefined) {
                        return result;
                    }
                }
            }
            i++;
        }
    }
}


function findFileByID(file, id) {
    var isFound = false;
    var i = 0;
    var result = undefined;
    if (file._id === id) {
        return file;
    } else {
        while (!isFound && i < file._childrens.length) {
            if (file._childrens[i]._id === id) {
                isFound = true;
                return file._childrens[i];
            } else {
                result = findFolderByID(file._childrens[i], id);
                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    }
}

function getPathOfFile(file, id, path) {
    path.push(file._fileName);
    var isFound = false;
    var i = 0;
    var result = undefined;
    if (file._id === id) {
        result = file;
        return result;
    } else {
        while (!isFound && i < file._childrens.length) {
            if (file._childrens[i]._id === id) {
                isFound = true;
                path.push(file._childrens[i]._fileName);
                result = file._childrens[i];
                return result;
            } else {
                if (file._childrens[i]._type === 'directory') {
                        result = getPathOfFile(file._childrens[i], id, path);
                        if (result !== undefined) {
                            return result;
                        }
                }
            }
            i++;
        }
    }
    path.pop();
}


function findFolderByName(file, fileName) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === fileName) {
            return file._childrens[i];
        }
    }
    return undefined;
}


function findFatherFolderByID(file, id) {
    var isFound = false;
    var i = 0;
    var result = undefined;
    while (!isFound && i < file._childrens.length) {
        if (file._childrens[i]._id === id) {
            return file;
        } else {
            result = findFatherFolderByID(file._childrens[i], id);
            if (result !== undefined) {
                return result;
            }
        }
        i++;
    }
}

function isFatherOf(father, son) {
    for (var i = 0; i < father._childrens.length; i++) {
        if (father._childrens[i] === son) {
            return true;
        }
    }
    return false;
}

function isFileExist(name, file) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            return true;
        }
    }
    return false;
}

function isFolder(name, file) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            if (file._childrens[i]._type === 'directory') {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
}

function getContent(str) {
    var words = str.split(' ');
    var content = '';
    for (var i = 2; i < words.length; i++) {
        content += words[i] + " ";
    }
    return content;
}

function printFile(name, file) {
    var typeOfFile = null;
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            typeOfFile = file._childrens[i]._type;
            switch (typeOfFile) {
                case 'txt':
                    console.log(file._childrens[i]._fileName + ":");
                    console.log("\t" + file._childrens[i]._content + "\n");
                    break;
            }
        }
    }
}


function changeContentOfFileTo(name, content, file) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            file._childrens[i]._content = content;
            console.log("You have been successfully wrote into " + name + "\n");
        }
    }
}


function getFolderToDelete(name, file) {
    for (var i = 0; i < file._childrens.length; i++) {
        if (file._childrens[i]._fileName.toLowerCase() === name) {
            return file._childrens[i];
        }
    }
}


function cloneArray(array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}


function printFileObject(fileName, object) {
    var file = findFolderByName(object.root, fileName);
}


function mergeSort(array, type) {
    if (array.length < 2) {
        return array;
    }

    var middle = Math.floor(array.length / 2);
    var left = array.slice(0, middle);
    var right = array.slice(middle);

    switch (type){
        case 'score':
            return mergeScore(mergeSort(left, type), mergeSort(right, type));
            break;
        case 'graph':
            return mergeGraph(mergeSort(left, type), mergeSort(right, type));
            break;
    }
    return;
}

function mergeScore(left, right) {
    var result = [];
    var indexLeft = 0;
    var indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft].score > right[indexRight].score) {
            result.push(left[indexLeft++]);
        } else if (left[indexLeft].score === right[indexRight].score){
                if (left[indexLeft].name < right[indexRight].name){
                    result.push(left[indexLeft++]);
                } else {
                    result.push(right[indexRight++])
                }
        } else {
            result.push(right[indexRight++]);
        }
    }

    return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));

}


function mergeGraph(left, right) {
    var result = [];
    var indexLeft = 0;
    var indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft]._id < right[indexRight]._id) {
            result.push(left[indexLeft++]);
        } else {
            result.push(right[indexRight++]);
        }
    }

    return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));

}


function getIndexFromArray(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            return i;
        }
    }
    return -1;
}

function occurrencesInContent(string, subString){
    if (string <= 0){
        return 0;
    }

    var count = 0;
    var index = 0;
    var step = subString.length;
    var isProgress = true;

    while(index+step < string.length && isProgress){
        if (string.includes(subString,index)){
            index += step;
            count++;
        } else {
            isProgress = false;
        }
    }

    return count;

}


function convertFromGraphToLinearArray(object){
    var linearArraySystem = [];
    insertSystemToArray(object.root, linearArraySystem, object);
    return linearArraySystem;
}


function convertFromLinearArrayToGraph(array, object){
   array = mergeSort(array, 'graph');
   removeDuplicate(array);
   object.root = array[0];
   if (array.length > 0){
        var tempFile = null;
        for (var i=1; i<array.length; i++){
            tempFile = findFileByID(object.root, array[i]._parent);
            if (array[i]._type === 'directory'){
                addFolderChildToFile(tempFile, array[i]._fileName, object);
            } else {
                addFileChildToFile(tempFile, array[i]._fileName, array[i]._type, array[i]._content, object);
            }

        }
        object.id = array[array.length-1]._id + 1;
   }
}

function removeDuplicate(array){
    var index = 0;
    while(index < array.length-1){
        if (array[index]._id === array[index+1]._id){
            array.splice((index+1),1);
        } else {
            index++;
        }
    }
}



function insertSystemToArray(file, linearArray, object){
    linearArray.push({
        _fileName: file._fileName,
        _id: file._id,
        _type: file._type,
        _content: file._content,
        _parent:  file._parent,
        _childrens: []
    });
    for (var i=0; i<file._childrens.length; i++){
        insertSystemToArray(file._childrens[i], linearArray, object);
    }
}


function insertLinearArrayToFile(fileNameWriteTo, linearArray){
    const fs = require('fs');
    fs.writeFileSync(__dirname +"/"+ fileNameWriteTo, JSON.stringify(linearArray));
}


function getLinearArrayFromFile(fileNameReadFrom){
    const fs = require('fs');
    try{
        var linearArray = fs.readFileSync(__dirname +"/"+ fileNameReadFrom).toString();
        if (linearArray !== ''){
            linearArray = JSON.parse(linearArray);
        } else {
            console.log("\'"+fileNameReadFrom+"\' is empty");
        }
    } catch (e){
        linearArray = 0;
    }

    return linearArray;
}
