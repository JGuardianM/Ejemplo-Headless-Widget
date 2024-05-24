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
    if(id_site=="57239fae78480601038b4567"){
      for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        if(i==0){
          const label = document.createElement('label');
          label.textContent = fields[i].label;
          container.appendChild(label);
          container.appendChild(document.createElement('br'));
          container.appendChild(document.createElement('br'));
        }
        if (field.name === "bluetooth_device" && field.label === "N") {
          const input = document.createElement('input');
          input.setAttribute('type', field[0].type);
          input.setAttribute('name', field[0].name);
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
          break;
        }
      }
    }else{
      fields.forEach((field, index) => {
        const label = document.createElement('label');
        label.textContent = field.label;
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
        if(field.type=="instructions"){
          const img  = document.createElement('img');
          img.src ="data:image/png;base64," + field.imgBase64File;
          container.appendChild(img);
        }else if(field.type=="externalAction"){
          const img  = document.createElement('img');
          img.src =field.imgBase64File;
          container.appendChild(img);
        }
        else{
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
    if(id_site=="57239fae78480601038b4567"){
      valores["challenge"]="challenge";
      valores["connection"]="connection";
      valores["bluetooth_device"]="bluetooth_device";
    }
    return valores;
  }

  document.getElementById('button1').addEventListener('click', GetSite);
  document.getElementById('button2').addEventListener('click', ConnectSite);