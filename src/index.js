import * as SyncfyWidget from '@syncfy/authentication-widget';

let authorization={ }


const configuration={
  // It specifies the widget language. Default='en'. Allowed values: 'en' or 'es'.
locale: "es",
}
let id_site="";

function GetSite() {
  GetToken();
  let fields = [];
  SyncfyWidget.headless
  .getSite(authorization, id_site, configuration)
  .then((apiSite) => {
    SyncfyWidget.headless
      .siteConnection(authorization, apiSite, configuration)
      .then((site) => {
          if (site.version === 1) {
            mostrarFields(site.getFields());
          }
      });
  })
  
}
  

function ConnectSite() {
    let data=GetData();
    SyncfyWidget.headless
    .getSite(authorization, id_site, configuration)
    .then((apiSite) => {
      SyncfyWidget.headless
        .siteConnection(authorization, apiSite, configuration)
        .then((site) => {
            if (site.version === 1) {
              site.connect(data);
            }
            site.on('socket-message', (CredentialStatus) => {
              if(CredentialStatus.code=="410"){
                SyncfyWidget.headless
                .twofa(authorization, CredentialStatus, configuration)
                    .then((twofa) => {
                      mostrarTwofa(twofa.getFields(), CredentialStatus);
                  });
              }
              if(CredentialStatus.code=="103"){
                console.log("token recibido")
              }
              if(CredentialStatus.code=="102"){
                console.log("Sesión iniciada correctamente")
              }
              if(CredentialStatus.code=="200"){
                console.log("Se sincronizó la credencial correctamente")
              }
          });
            
        });
    })
  }
  
  function GetToken(){
    const inputs = document.querySelectorAll('#sessionToken input');
    const valores = {};
    inputs.forEach(input => {
      valores[input.name] = input.value;
    });
    let Stoken= valores["token"];
    authorization={ token: Stoken,}
    id_site=valores["site"];
  }

  function mostrarFields(fields) {
    const container = document.getElementById('siteFields');
    fields.forEach((field, index) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      const input = document.createElement('input');
      input.setAttribute('type', field.type);
      input.setAttribute('name', field.name);
      input.setAttribute('required', field.required);
  
      container.appendChild(label);
      container.appendChild(input);
  
      container.appendChild(document.createElement('br'));
    });
  }

  function mostrarTwofa(fields, CredentialStatus) {
    const container = document.getElementById('twofaFields');
    container.appendChild(document.createElement('br'));

    fields.forEach((field, index) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      container.appendChild(label);
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createElement('br'));
      if(field.type=="instructions"){
        const img  = document.createElement('img');
        img.src ="data:image/png;base64," + "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";
        container.appendChild(img);
      }else if(field.type=="externalAction"){
        const img  = document.createElement('img');
        img.src =field.imgBase64File;
        container.appendChild(img);
      }else{
        const input = document.createElement('input');
        input.setAttribute('type', field.type);
        input.setAttribute('name', field.name);
        input.setAttribute('required', field.required);
        container.appendChild(input);
        container.appendChild(document.createElement('br'));
        const botonTwofa = document.createElement('button');
        botonTwofa.type = 'button'; 
        botonTwofa.textContent = 'Enviar'; 
        botonTwofa.addEventListener('click', () => {
          enviarTwofa(CredentialStatus); 
        });
        container.appendChild(document.createElement('br'));
        container.appendChild(botonTwofa);
      }
    });

  }

  function enviarTwofa(CredentialStatus){
    let data=GetDataTwofa();
    console.log(data);
     SyncfyWidget.headless
    .twofa(authorization, CredentialStatus, configuration)
        .then((twofa) => {
          twofa.authenticate(data);
      });
      
  }


  function GetData() {
    const inputs = document.querySelectorAll('#siteFields input');
    const valores = {};
    inputs.forEach(input => {
      valores[input.name] = input.value;
    });
    return valores;
  }


  function GetDataTwofa() {
    const inputs = document.querySelectorAll('#twofaFields input');
    const valores = {};
    inputs.forEach(input => {
      valores[input.name] = input.value;
    });
    return valores;
  }

  document.getElementById('button1').addEventListener('click', GetSite);
  document.getElementById('button2').addEventListener('click', ConnectSite);