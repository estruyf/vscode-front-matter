const fs = require('fs');
const path = require('path');

const pkgJson = require('../../package.json');

if (pkgJson?.contributes?.configuration) {
    const schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://frontmatter.codes/frontmatter.schema.json",
        ...pkgJson.contributes.configuration
    }

    fs.writeFileSync(path.join(path.resolve('.'), '/public/frontmatter.schema.json'), JSON.stringify(schema, null, 2));
}