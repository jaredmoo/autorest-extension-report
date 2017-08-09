import { AutoRestExtension } from "./lib/extension-base";

const extension = new AutoRestExtension();

function generateOperationNames(path: string, methods: string[])
{
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
    const isNonParameterSegment = (s: string) => !s.includes("{")
    const nonParameterSegments = segments.filter(isNonParameterSegment);

    // Join the remaining non-parameter segments and add final "/" if the last segment is a parameter segment
    const lastSegmentIsParameter = !isNonParameterSegment(segments[segments.length - 1]);
    const joinedSegments =
        nonParameterSegments.join("/").toUpperCase() +
        (lastSegmentIsParameter ? "/" : "");

    // Write out
    let opNames: string[] = [];
    for (let method in methods)
    {
        const operationName = method.toUpperCase() + joinedSegments
        opNames.push(operationName)
    }

    return opNames;
}

extension.Add("report", async autoRestApi => {
    // read files offered to this plugin
    const inputFileUris = await autoRestApi.ListInputs();
    const inputFiles = await Promise.all(inputFileUris.map(uri => autoRestApi.ReadFile(uri)));

    let operations: string[] = [];
    for (let inputFile of inputFiles)
    {
        // Parse the input file as JSON
        const json = JSON.parse(inputFile);

        // For each path, generate the operation names for that path
        for (let path in json.paths)
        {
            operations = operations.concat(generateOperationNames(path, json.paths[path]));
        }
    }

    // Sort operations
    operations.sort();

    // Write all operations to file
    autoRestApi.WriteFile("operations.txt", operations.join("\n"));
});

extension.Run();