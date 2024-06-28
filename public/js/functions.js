
(function () {
    'use strict'
      console.log("funcion cargada")
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
    console.log('---------------------')
    console.log(forms)
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
})();

function tipoTicket(obj){
    const telefono = document.getElementById('telefono')
    switch (Number(obj)){
        case 0:
            telefono.classList.add('d-none');
        break;
        case 1:
            telefono.classList.remove('d-none');
        break;
        default:
            telefono.classList.add('d-none');
        break;
    }
};

async function atachCola(n,obj){
    const data = JSON.parse(obj)
    const URL = 'http://localhost:3000/generateTicket'
    const response = await fetch(URL,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json', 
        },
        body:JSON.stringify({
            servicio: n,
            cedula: data.cedula,
            tipo: data.tipo,
            telefono: data.telefono
        })
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    if(jsonResponse.status){
      Swal.fire({
        icon: 'success',
        title: 'Su numero: '+jsonResponse.ticket,
        text: 'Pronto sera atendido tiempo estimado: 30 minutos',
        showConfirmButton: true,
      }).then(()=>{
        window.location = '/'
      })
    }
    //location.replace('/ticketCliente/'+jsonResponse.ticket)
};

if(location.pathname === '/secuencia'){
    let oficina = document.getElementById('oficina').innerHTML
    console.log(oficina)
    webSocket = new WebSocket('ws://localhost:3001');
    const id = oficina
     webSocket.onopen = () =>{
       let data = {};
       data.id = id;
       //data.path = window.location.pathname;
       webSocket.send(JSON.stringify(data));
    }
  
    console.log("Session ID:", id);
    webSocket.onmessage = (event) =>{
      let data = JSON.parse(event.data);
      Object.values(data).forEach((ticket)=>{
         if (ticket != null){
          let show = document.getElementById(ticket.servicio);
          show.innerHTML = ticket.ticket; 
        }
      })
    }
};

if(location.pathname === '/agente'){
  let agente = document.getElementById('agente').innerHTML
  console.log('ela gente es: '+agente)
  webSocket = new WebSocket('ws://localhost:3001');
  const id = agente
   webSocket.onopen = () =>{
     let data = {};
     data.id = id;
     //data.path = window.location.pathname;
     webSocket.send(JSON.stringify(data));
  }

  console.log("Session ID:", id);
  webSocket.onmessage = (event) =>{
    let data = JSON.parse(event.data);
    console.log(data)
    let button = document.getElementById('agenteButton');
    let a = data != null ? data.ticket : '';
    button.innerHTML = 'Atender: '+ a;
    button.value = data != null ? data._id : '';
  }
};

async function tomarTicket (id){
  let atender = document.getElementById('atendido');
  let anular = document.getElementById('anular');
  atender.innerHTML = 'Cerrar: '+ id.innerHTML;
  anular.innerHTML = 'Anular: '+ id.innerHTML;
  atender.value = id.value;
  anular.value = id.value;
  console.log(id.value)
  const URL = 'http://localhost:3000/tomarTicket'
  let  response = await fetch(URL,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json', 
    },
    body:JSON.stringify({
      ticket: id.value,
    })
  })
  const jsonResponse = await response.json();
};

async function cerrarAnular(id,opc){
  console.log(opc+': '+id.value)
  
  const URL = 'http://localhost:3000/atenderAnular'
  let  response = await fetch(URL,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json', 
    },
    body:JSON.stringify({
      ticket: id.value,
      accion: opc,
    })
  })
  const jsonResponse = await response.json();
}