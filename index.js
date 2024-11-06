import axios from "axios";
import Papa from 'papaparse'
import fs from 'fs'
import {format} from 'date-fns'

const url_azure = ""

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
            id: resp2.data.id,
            titulo: resp2.data.fields["System.Title"],
            descricao: resp2.data.fields["System.Description"].replace('<div>','').replace('</div>',''),
            complexidade: resp2.data.fields["Custom.Complexity"],
            area: resp2.data.fields["System.AreaPath"],
            fechado_por: resp2.data.fields["Microsoft.VSTS.Common.ClosedBy"].displayName,
            data_criacao: format( resp2.data.fields["System.CreatedDate"], "dd/MM/yyyy HH:mm:ss" ) ,
            data_fechamento: format( resp2.data.fields["Microsoft.VSTS.Common.ClosedDate"], "dd/MM/yyyy HH:mm:ss" ) ,
            atividade: resp2.data.fields["Microsoft.VSTS.Common.Activity"] ? resp2.data.fields["Microsoft.VSTS.Common.Activity"] : ""
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
