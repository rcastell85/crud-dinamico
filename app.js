// Variables de inputs del formulario
const name = document.querySelector('#nombre');
const fNac = document.querySelector('#fechaNacimiento');
const mail = document.querySelector('#email');
var sexArray = Array.from(document.getElementsByName('sexo'));
var sexo;

btnGuardar = document.getElementById('guardarUsuario');
btnGuardar.disabled = true;

// Creamos objeto Usuario
class Usuario {
    constructor (id, nombre, fechaNacimiento, sexo, email) {
        this.id = id;
        this.nombre = nombre;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
        this.email = email;
    }

    calcularEdad(){
        const anioNacimiento = new Date(this.fechaNacimiento).getFullYear();
        const edad = new Date().getFullYear() - anioNacimiento;
        return edad + " años";
    }
}

const estado = {
    currentUserId: "",
    usuarios: [],
    pages: 1,
    pagina: 1,
    results: 0
}

// Guardar datos en localstorage
const persistData = arr => {
    localStorage.setItem('usuarios', JSON.stringify(arr));
}

// Traer datos de localstorage
const getData = () => {
    const data = JSON.parse(localStorage.getItem('usuarios'));
    if (data) return data;
}

// Traer usuarios y mostrar en UI al cargar la pagina
window.addEventListener('load', e => {
    const users = getData();
    
    if (users) { 
        users.forEach(e => {
            const newUsuario = new Usuario(e.id, e.nombre, e.fechaNacimiento, e.sexo, e.email);

            estado.usuarios.push(newUsuario);
        });
    }

    renderResults(estado.usuarios);
    estado.pages = Math.ceil(estado.usuarios.length / 5);
    
    paginar(estado.pages, estado.pagina);
    estado.results = document.getElementsByTagName("tr").length - 1;
})

//Cada vez que presionamos "Cargar usuario" limpia los inputs
document.querySelector("#addUser").addEventListener('click', () => {
    
    estado.currentUserId = "";

    var inputs = Array.from(document.getElementsByTagName('input'));
    var spans = Array.from(document.getElementsByTagName('span'));
    
    btnGuardar.disabled = true;
    
    inputs.forEach(el => {
        if (el.id !== "sexo") {
            el.value = "";
            el.classList.remove("success");
            el.classList.remove("has-error");        
        }
    });

    spans.forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    })
});

// Eventos al presionar borrar o editar
document.querySelector('.body-usuarios').addEventListener('click', e => {
    var btn;
    
    if (e.target.closest('.bi-trash')){ //Si es este boton borramos usuario
        btn = e.target.closest('.bi-trash');
        // obtenemos id de elemento
        estado.currentUserId = parseInt(btn.parentNode.parentNode.id);
        
        //Borramos usuario de la data
        borrarDataUsuario(estado.currentUserId, estado.usuarios);
        estado.pages = Math.ceil(estado.usuarios.length / 5);

        //Borramos de la UI
        borrarUsuarioUI(estado.currentUserId);

        // Guardamos en localstorage
        persistData(estado.usuarios);
        
        // Actializamos numero de resultados por pagina
        estado.results = document.getElementsByTagName("tr").length - 1;

        if (estado.results > 0){
            // actualizamos UI 
            document.querySelector(".body-usuarios").innerHTML = '';
            renderResults(estado.usuarios, estado.pagina);
            paginar(estado.pages, estado.pagina);

        } else if (estado.results == 0 && estado.usuarios.length > 0) {
            document.querySelector("#lista-pag").removeChild(document.querySelector("#p-" + estado.pagina));
            document.querySelector("#lista-pag").lastChild.classList.add("activado");
            
            estado.pagina -= 1; 
        
            renderResults(estado.usuarios, estado.pagina);
        } else if (estado.usuarios.length == 0) {
            document.querySelector("#lista-pag").innerHTML = "";
        }

    } else if (e.target.closest('.bi-pencil-square')) { // Si es este se edita usuario
        btn = e.target.closest('.bi-pencil-square');
        btnGuardar.disabled = false;

        // obtenemos id de elemento
        estado.currentUserId = parseInt(btn.parentNode.parentNode.id);
        
        //Recuperamos data del usuario
        estado.usuarios.forEach(el => {
            if (el.id == estado.currentUserId) {
                name.value = el.nombre;
                fNac.value = el.fechaNacimiento;
                sexo = el.sexo;
                mail.value = el.email;
                name.classList.add("success");
                fNac.classList.add("success");
                mail.classList.add("success");
            }
        });
    }
});

// Evento al presionar 'Guardar usuario'
document.querySelector('#guardarUsuario').addEventListener('click', () => {
    estado.results = document.getElementsByTagName("tr").length - 1;
    estado.pages = Math.ceil(estado.usuarios.length / 5);
    var actualPages = estado.pages;

    if (estado.currentUserId) {//Existe usuario, asi que editamos
        
        const actUsuario = crearUsuario(estado.usuarios, estado.currentUserId);
        
        agregarUsuarioUI(actUsuario, estado.currentUserId);  

        // Guardamos en localstorage
        persistData(estado.usuarios);

    } else {// No existe usuario, creamos uno nuevo
    
        //Agregamos usuario
        const newUsuario = crearUsuario(estado.usuarios);
        estado.pages = Math.ceil(estado.usuarios.length / 5);
        // Guardamos en localstorage
        persistData(estado.usuarios);
        
        //añadimos usuario a UI  
        if  (estado.results < 5){
            agregarUsuarioUI(newUsuario);
            paginar(estado.pages, estado.pagina);
        } else if(estado.pagina == actualPages && estado.results ==  5) {
            cambiarPagina(estado.pagina += 1);
        } else if(actualPages != estado.pages) {
            paginar(estado.pages, estado.pagina);
        }
 
        estado.results = document.getElementsByTagName("tr").length - 1;
    }
});

// Validacion de todos los campos
document.querySelector('#formulario').addEventListener('keyup', e => {
    const el = e.target;
    
    validarVacio(el);//Validamos que no este vacio
    
    if (el.id == "email" && el.value.trim().length > 0) {
        validarEmail(el);// Validamos que sea una direccion email valida
    }

    if (name.classList.contains("success") && fNac.classList.contains("success") && mail.classList.contains("success")) {
        btnGuardar.disabled = false;
    } else {
        btnGuardar.disabled = true;
    }
});

// Eventos en los botones de paginacion
document.querySelector("#lista-pag").addEventListener('click', e => {
    estado.pages = Math.ceil(estado.usuarios.length / 5);

    estado.pagina = parseInt(e.target.textContent); 
    
    document.querySelector(".body-usuarios").innerHTML = '';

    renderResults(estado.usuarios, estado.pagina);

    paginar(estado.pages, estado.pagina);
 })

//Funcion para cambiar de pagina
const cambiarPagina = (nextPage) => {
    let element = document.querySelector("#lista-pag");
    element.lastChild.classList.remove("activado");

    document.querySelector(".body-usuarios").innerHTML = '';

    renderResults(estado.usuarios, nextPage);

    element.insertAdjacentHTML('beforeend', `<li class="list-group-item activado" id="p-${nextPage}">${nextPage}</li>`)
}

//Funcion para crear Usuario nuevo
const crearUsuario = (array, id=null) => {
    sexArray.forEach(e => {
        if (e.checked) {
           sexo = e.value
        }
    });
    
    if (id != null) {
        const index = array.findIndex(el => el.id == id);
    
        estado.usuarios[index].nombre = name.value;
        estado.usuarios[index].fechaNacimiento = fNac.value;
        estado.usuarios[index].sexo = sexo;
        estado.usuarios[index].email = mail.value;

        return estado.usuarios[index];
    } else { 

        if(array.length > 0){
            id = array[array.length -1].id + 1;
        } else {
            id = 1;
        }

        //obtenemos data del form y creeamos usuario nuevo
        nombre = name.value;
        fechaNacimiento = fNac.value;
        email = mail.value;
        sexo = sexo;
       
        
        const newUsuario = new Usuario(id, nombre, fechaNacimiento, sexo, email);

        array.push(newUsuario);

        return newUsuario;
    }
}

//Funcion para agregar usuario en la UI
const agregarUsuarioUI = (usuario, id=null) => {

    const markup = `
        <tr id="${usuario.id}">
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.calcularEdad()}</td>
            <td>${usuario.sexo}</td>
            <td>${usuario.email}</td>
            <td>
                <svg class="bi bi-pencil-square" data-toggle="modal" data-target="#myModal" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.502 1.94a.5.5 0 010 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 01.707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 00-.121.196l-.805 2.414a.25.25 0 00.316.316l2.414-.805a.5.5 0 00.196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-6a.5.5 0 00-1 0v6a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5H9a.5.5 0 000-1H2.5A1.5 1.5 0 001 2.5v11z" clip-rule="evenodd"/>
                </svg>
                <svg class="bi bi-trash" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clip-rule="evenodd"/>
                </svg>
            </td>
        </tr>
    `;

    if (id != null) {
        var el = document.getElementById(id);
        
        el.childNodes[3].textContent = usuario.nombre;
        el.childNodes[5].textContent = usuario.calcularEdad();
        el.childNodes[7].textContent = usuario.sexo;
        el.childNodes[9].textContent = usuario.email;

    } else {
        document.querySelector('.body-usuarios').insertAdjacentHTML('beforeend', markup); 
    }
    
}

// Funcion para borrar usuario de array
const borrarDataUsuario = (id, array) => {
    let index, ids;

    ids = array.map(cur => cur.id);
    index = ids.indexOf(id);

    if (index !== -1){
        array.splice(index, 1);
    }
}

// Funcion para borrar usuario de UI
const borrarUsuarioUI = id => {
    el = document.getElementById(id);
    el.parentNode.removeChild(el)
}

// Funcion para validar input vacio
const validarVacio = (el) => {
    const valor = el.value.trim();

    if (valor.length != 0) {
        if (el.classList.contains('has-error')) {
            el.classList.remove('has-error');
        }
        el.classList.add('success');
        if (el.id != "sexo") {
            document.querySelector('#span-error-' + el.id).style.display = "none";
            document.querySelector('#span-error-' + el.id).textContent = "";
        }
    } else {
        if (el.classList.contains('success')) {
            el.classList.remove('success');
        }
        el.classList.add('has-error');
        if (el.id != "sexo") {
            document.querySelector('#span-error-' + el.id).style.display = "block";
            document.querySelector('#span-error-' + el.id).textContent = "Este campo no puede estar vacio.";          
        }

    }
}

// Funcion para validar que sea email valido
const validarEmail = el => {
    var texto = el.value.trim();
    var regex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;

    if (!regex.test(texto)) {
        el.classList.remove('success');
        el.classList.add('has-error');
        document.querySelector('#span-error-' + el.id).style.display = "block";
        document.querySelector('#span-error-' + el.id).textContent = "El correo es invalido.";
    } 
}

//Funcion para mostrar resultados con paginacion
const renderResults = (array, page = 1, resPerPage = 5) => {

    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    array.slice(start, end).forEach(e => {
        agregarUsuarioUI(e);
    }); 
    
}

//Funcion de paginacion
const paginar = (pages, pagActual) => {
    document.querySelector("#lista-pag").innerHTML = "";

    for (let i=1; i <= pages; i++) {
        document.querySelector("#lista-pag").insertAdjacentHTML("beforeend", `<li class="list-group-item ${pagActual == i ? "activado" : ""}" id="p-${i}">${i}</li>`);
    }
};


    













