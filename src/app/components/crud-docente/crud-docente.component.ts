import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Docente } from 'src/app/models/docente.model';
import { Ubigeo } from 'src/app/models/ubigeo.model';
import { DocenteService } from 'src/app/services/docente.service';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-crud-docente',
  templateUrl: './crud-docente.component.html',
  styleUrls: ['./crud-docente.component.css']
})
export class CrudDocenteComponent implements OnInit {

  //Para la Grilla
   docentes: Docente [] = [];
   filtro: string ="";
 
   //Para el ubigeo
   departamentos: string[] = [];;
   provincias: string[] = [];;
   distritos: Ubigeo[] = [];;

   
  //Json para registrar o actualizar
  docente: Docente = { 
    idDocente:0,
    nombre:"",
    dni:"",
    estado:1,
    ubigeo:{
      idUbigeo: -1,
      departamento:"-1",
      provincia:"-1",
      distrito:"-1",
    }
  };


  formsRegistra = this.formBuilder.group({
    validaNombre: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñ0-9 ]{3,30}')]],
    validaDni: ['', [Validators.required,Validators.pattern('[0-9]{8}')]],
    validaDepartamento: ['', [Validators.min(1)]],
    validaProvincia: ['', [Validators.min(1)]],
    validaDistrito: ['', [Validators.min(1)]]
  });

  formsActualiza = this.formBuilder.group({
    validaNombre: ['', [Validators.required, Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñ0-9 ]{3,30}')]],
    validaDni: ['', [Validators.required,Validators.pattern('[0-9]{8}')]],
    validaDepartamento: ['', [Validators.min(1)]],
    validaProvincia: ['', [Validators.min(1)]],
    validaDistrito: ['', [Validators.min(1)]],
    validaEstado: ['', [Validators.min(0)]],
  });

  constructor(private formBuilder: FormBuilder,private docenteService:DocenteService, private ubigeoService:UbigeoService) {
      this.ubigeoService.listarDepartamento().subscribe(
          response => this.departamentos = response
      );            
  }

  cargaProvincia(){
    this.ubigeoService.listaProvincias(this.docente.ubigeo?.departamento).subscribe(
      response =>  this.provincias= response
    );

    this.distritos = [];
    this.docente.ubigeo!.idUbigeo = -1;
    this.docente.ubigeo!.provincia = "-1";
}

cargaDistrito(){
        this.ubigeoService.listaDistritos(this.docente.ubigeo?.departamento, this.docente.ubigeo?.provincia).subscribe(
          response =>  this.distritos= response
        );
        
        this.docente.ubigeo!.idUbigeo = -1;
 }

 
 ngOnInit(): void {
}

  consultaDocente(){
        console.log(">>> consultaDocente >>> " +  this.filtro);
        this.filtro = this.filtro == "" ? "todos" : this.filtro;
        this.docenteService.consultaPorNombre(this.filtro).subscribe(
              x => this.docentes = x
        );
  }

  registra(){
    if (this.formsRegistra.valid){
        this.docenteService.inserta(this.docente).subscribe(
              x => { 
                        document.getElementById("btn_reg_cerrar")?.click();
                        this.docenteService.consultaPorNombre(this.filtro==""?"todos":this.filtro).subscribe(
                              x => this.docentes = x
                        );
                        Swal.fire('Mensaje', x.mensaje, 'info'); 
                        this.docente = { 
                          idDocente:0,
                          nombre:"",
                          dni:"",
                          estado:1,
                          ubigeo:{
                            idUbigeo: -1,
                            departamento:"-1",
                            provincia:"-1",
                            distrito:"-1",
                          }
                        };
                    }   
        );
        }
  }   

  elimina(obj:Docente){
          Swal.fire({
            title: '¿Desea eliminar?',
            text: "Los cambios no se van a revertir",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, elimina',
            cancelButtonText: 'No, cancelar'
          }).then((result) => {
                if (result.isConfirmed) {
                    this.docenteService.elimina(obj.idDocente || 0).subscribe(
                          x => {
                                this.docenteService.consultaPorNombre(this.filtro==""?"todos":this.filtro).subscribe(
                                  x => this.docentes = x
                                );  
                                Swal.fire('Mensaje', x.mensaje, 'info');
                          }
                    );
                }
          })   
   }

   actualizaEstado(obj:Docente){
      obj.estado = obj.estado == 1? 0 : 1;  
      this.docenteService.actualiza(obj).subscribe();
   }

   busca(obj:Docente){
        this.docente = obj;
  
        this.ubigeoService.listaProvincias(this.docente.ubigeo?.departamento).subscribe(
          response =>  this.provincias= response
        );
  
        this.ubigeoService.listaDistritos(this.docente.ubigeo?.departamento, this.docente.ubigeo?.provincia).subscribe(
          response =>  this.distritos= response
        );
   }  

   actualiza(){
    if (this.formsActualiza.valid){
        this.docenteService.actualiza(this.docente).subscribe(
              x => { 
                document.getElementById("btn_act_cerrar")?.click();
                this.docenteService.consultaPorNombre(this.filtro==""?"todos":this.filtro).subscribe(
                      x => this.docentes = x
                );
                Swal.fire('Mensaje', x.mensaje, 'info'); 
              }   
        );
      }
    }
}
