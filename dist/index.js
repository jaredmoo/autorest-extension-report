"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const extension_base_1 = require("./lib/extension-base");
const extension = new extension_base_1.AutoRestExtension();
function generateOperationNames(path, methods) {
    // Convert the path and method to operation name
    // e.g. path: /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}
    //      -> op name /SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.SQL/SERVERS
    //
    //      path: /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/
    //
    //      -> op name /SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.SQL/SERVERS/
    // Split the uri into segments
    const segments = path.split("/");
    // Drop parameter segments, which are the segments that contain "{"
    const isParameterSegment = (s) => !s.includes("{");
    const nonParameterSegments = segments.filter(isParameterSegment);
    // Join the remaining non-parameter segmentsand add final "/" if the last segment is not a parameter segment
    const joinedSegments = nonParameterSegments.join("/").toUpperCase() +
        (isParameterSegment(segments[segments.length - 1]) ? "/" : "");
    // Write out
    let opNames = [];
    for (let method in methods) {
        const operationName = method.toUpperCase() + joinedSegments;
        opNames.push(operationName);
    }
    return opNames;
}
extension.Add("report", (autoRestApi) => __awaiter(this, void 0, void 0, function* () {
    // read files offered to this plugin
    const inputFileUris = yield autoRestApi.ListInputs();
    const inputFiles = yield Promise.all(inputFileUris.map(uri => autoRestApi.ReadFile(uri)));
    let operations = [];
    for (let inputFile of inputFiles) {
        // Parse the input file as JSON
        const json = JSON.parse(inputFile);
        // For each path, generate the operation names for that path
        for (let path in json.paths) {
            operations = operations.concat(generateOperationNames(path, json.paths[path]));
        }
    }
    // Sort operations
    operations.sort();
    // Write all operations to file
    autoRestApi.WriteFile("operations.txt", operations.join("\n"));
}));
extension.Run();
