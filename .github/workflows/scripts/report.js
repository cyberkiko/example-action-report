
module.exports = async ({github, context, core}) => {
  
  // Repository list to check 
  const repos = [
    "test-site1", 
    "test-site2", 
    "test-site3", 
    "test-site4"
  ]

  // decode file hash and convert to json object
  function decodeToJson(encodedString, encoding) {
    const json = Buffer.from(encodedString, encoding).toString();

    return JSON.parse(json);
  }

  function encodeToBase64(content) {
    const encodedString = Buffer.from(content).toString('base64')

    return encodedString
  }

  // reduce repo dependencies based on required ones"
  function parseDependencies(dependenciesList) {
    // custom list
    const componentsList = [
      "compA", 
      "compB", 
      "compC"
    ]
    
    const filteredDependencies = componentsList.reduce((result, key) => {
    
      if (dependenciesList.hasOwnProperty(key)) {
        result[key] = dependenciesList[key];
      }
        return result;
    }, {});

    return filteredDependencies
  }

  // calls git api to get package json and return dependencies object
  async function checkRepoDependencies(repo) {
    const packageFile = await github.rest.repos.getContent({
        owner: context.repo.owner,
        repo: repo,
        path: "package.json"
    })

    const fileJson = decodeToJson(packageFile.data.content, packageFile.data.encoding)
    return parseDependencies(fileJson.dependencies)
  }

  async function addFile(repo, filepath, fileBase64Content) {
    const file = await github.rest.repos.createOrUpdateFileContents({
      owner: context.repo.owner,
      repo: repo,
      path: filepath,
      message: 'Updated content',
      content: fileBase64Content,
    })
  }


  // main return json object with sites and depdendencies versions

  let exportJson = []

  for (const repo of repos) {
    let dependencies = await checkRepoDependencies(repo)

    let repoDepObject = {
      "repo": repo,
      "dependencies": dependencies 
    }

    exportJson.push(repoDepObject)
  };
  

  console.log(exportJson)

  const encodedObject = encodeToBase64(JSON.stringify(exportJson))

  addFile('report-test', 'data.json', encodedObject)

  // can do here another github call to export this to file. 

}