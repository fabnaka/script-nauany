import axios from "axios";
import Papa from 'papaparse'
import fs from 'fs'

const url_azure = "https://dev.azure.com/acto-solucoes/IMASUL-MS/_apis/wit/wiql/c70d0c7d-c4a6-4c18-9a8b-1a479bbb7f00?api-version=7.0"

const user = ""
const password = ""

const outputFile = "output.csv";

chamadaApiPrincipal()

async function chamadaApiPrincipal() {
  try {
    let resp = await axios({
      method: 'get',
      url: url_azure,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic` + Buffer.from(user + ":" + password).toString('base64') 
      } 
    })

    let items_array = []

    if( resp.data && resp.data.workItemRelations && resp.data.workItemRelations.length ) {
      for(const e of resp.data.workItemRelations) {
        let resp2 = await axios({
          method: 'get',
          url: e.target.url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic` + Buffer.from(user + ":" + password).toString('base64') 
          }
        })

        //console.log(resp2.data)

        if(resp2.data) {
          items_array.push({
            titulo: resp2.data.fields["System.Title"],
            descricao: resp2.data.fields["System.Description"].replace('<div>','').replace('</div>',''),
            complexidade: resp2.data.fields["Custom.Complexity"],
            area: resp2.data.fields["System.AreaPath"]
          })
        }
      }

      console.log(items_array)

      let csv = Papa.unparse(items_array);

      fs.writeFile('output.csv', csv, (err) => {
        if (err) {
          console.error('Erro ao escrever o arquivo:', err);
        } else {
          console.log('Arquivo CSV criado com sucesso!');
        }
      });

    }
  } catch (err) {
    console.log(err)
  }
}
