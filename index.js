const fs = require('fs')
const csv = require('fast-csv');
const crypto = require('crypto');
const { Parser } = require('json2csv');





const data = []
const records = [];
const dats = []

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  readline.question(`Enter Filename (do not include the extension)?  `, name => {
    console.log(`File Name: ${name}.csv`);
  
  
    fs.createReadStream(`./${name}.csv`)
  .pipe(csv.parse({ headers: true }))
  .on("headers", (headers) => {
    headers.push("Hash");



    const headerRow = {};
    headers.forEach((col) => {
      headerRow[col] = col;
    });

    headerRow["Hash"] = "Hash";
    records.push(headerRow);


   
  })
  .on('error', error => console.error(error))
  .on('data', row =>{
    row.Hash = crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex')
    data.push(row)
    const ser = row["Series Number"] || "";
    if (ser.toLowerCase().startsWith("team")) {
      cur = ser;
    }

    if (row["Filename"]) {
      dats.push({ ...row, Team: cur });
      records.push(row);
    } else {
      records.push(row);
    }
  })
  .on('end', () => {
    // console.log(data)
   
    
    dats.forEach((dat) => {
      const jsonData = {
        format: "CHIP-0007",
        name: dat["Name"],
        description: dat["Description"],
        minting_tool: dat["Team"],
        sensitive_content: false,
        series_number: parseInt(dat["Series Number"]),
        series_total: dats.length,
        attributes: [
          {
            trait_type: "gender",
            value: dat["Gender"],
          },
        ],
        collection: {
          name: "Zuri dat Tickets for Free Lunch",
          id: "b774f676-c1d5-422e-beed-00ef5510c64d",
          attributes: [
            {
              type: "description",
              value: "Rewards for accomplishments during HNGi9.",
            },
          ],
        },
      };

      // Add more attributes field if available
      if (dat["Attributes"]) {
        dat["Attributes"].split(";").forEach((attribute) => {
          if (attribute) {
            try {
              const values = attribute.split(":");
              const traitType = values[0].trim();
              const value = values[1].trim();

              jsonData["attributes"].push({
                trait_type: traitType,
                value: value,
              });
            } catch (err) {
              console.log("Invalid attribute in the file, please rectify it: ", attribute);
            }
          }
        });
      }

 

   
      const hashed = crypto.createHash('sha256').update(JSON.stringify(jsonData)).digest('hex')
      jsonData["Hash"] = hashed;
    
      fs.writeFileSync(`./files/${dat["Filename"]}.json`, JSON.stringify(jsonData));

     
    
    });

    // Write the CSV
    try {
        const parser = new Parser();
        const csv = parser.parse(data);
        fs.appendFile(`${name}.output.csv`, csv, 'utf-8', err => {
            if (err) {
              throw err;
            }
        })
        // console.log(csv);
      } catch (err) {
        console.error(err);
      }
})


// console.log(data)
    readline.close();
  })
