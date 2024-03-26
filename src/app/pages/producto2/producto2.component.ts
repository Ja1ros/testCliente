import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DataTableDirective, DataTablesModule } from "angular-datatables";
import { ToastrService } from "ngx-toastr";
import { ProductoService } from "../../Services/producto.service";
import * as filepond from "filepond";
import {
  IRequestProduct,
  RespImgbb,
  ResponseProduct,
} from "app/Models/InterfacesProducts";
import { IRespProduct } from "../../Models/InterfacesProducts";
import { IResp } from "app/Models/Interfaces";

@Component({
  selector: "app-producto",
  templateUrl: "./producto2.component.html"
})
export class Producto2Component implements OnInit {
  loading: boolean = false;
  constructor(
    private prodService: ProductoService,
    private toastr: ToastrService,
  ) { }

  rol: string = "";

  producto: IRequestProduct = {
    id: 0,
    nombre: "",
    img: "",
    precio: 0,
    peso: 0,
    stock: 0,
    estado: 1,
    codigo: "",
    categoria: 0
  };

  @ViewChild("closeModalProducto") closeModal: ElementRef;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptionsP: DataTables.Settings = {};

  ngOnInit(): void {
    console.log('ngOnInit is called.');
    this.rol = JSON.parse(localStorage.getItem("rol"));
    // this.loadProductosCategoria2();

    this.dtOptionsP = {
      ajax: (dataTablesParameters: any, callback) => {
        this.prodService.getProductosCategoria().subscribe((data) => {
          callback({ data: data.data });
        });
      },
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json",

        //url: "https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"
      },
      columns: [
        {
          title: "ID",
          data: "ID",
        },
        {
          title: "Nombre",
          data: "Nombre",
        },
        {
          title: "Imagen",
          data: "ImgUrl",
          render: function (data) {
            return `<img src="${data}" width="120" height="120" class="rounded mx-auto d-block" alt="No se puede mostrar la imágen">`;
          },
        },
        {
          title: "Precio",
          data: "Precio",
          render: $.fn.dataTable.render.number(",", ".", 2, "$"),
          type: "currency",
        },
        {
          title: "Codigo",
          data: "Codigo",
        },
        {
          title: "Peso",
          data: "Peso",
          render: $.fn.dataTable.render.number(",", ".", 4),
        },
        // {
        //   title: "Stock",
        //   data: "Stock",
        // },
        // {
        //   title: "Categoria",
        //   data: "ID_CAT",
        // },
      ],
      columnDefs: [
        {
          targets: 6,
          title: "Estado",
          data: "Estado",
          render: function (data, type, row) {
            return data == 1
              ? `<span class="badge bg-info">Activo</span>`
              : `<span class="badge bg-danger">Inactivo</span>`;
          },
        },
        {
          targets: 7,
          title: "Opciones",
          data: null,
          render: function (data, type, row) {
            return `<button
            #Editar
          id="EditarProducto"
          type="button"
          class="btn btn-info btn-sm"
          data-toggle="modal"
          data-target="#exampleModalProducto"
        >
          <i class="nc-icon nc-bullet-list-67"></i>
        </button>

        <button
          id="EliminarProducto" 
          class="btn btn-danger btn-sm"
        >
          <i class="nc-icon nc-simple-remove"></i>
        </button>`;
          },
        },
      ],
    };
  }
  loadProductosCategoria2() {
    this.prodService.getProductosCategoria().subscribe((data) => {
      // Actualiza la tabla con los datos de la categoría 2
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.clear();
        dtInstance.rows.add(data.data);
        dtInstance.draw();
      });
    });
  }

  validarProducto() {
    if (this.producto.nombre.length < 3) {
      this.showNotification("top", "center", 1, "Ingrese el nombre ");
      return false;
    }

    if (this.producto.precio <= 0) {
      this.showNotification("top", "center", 1, "Ingrese el precio ");
      return false;
    }

    if (this.producto.peso <= 0) {
      this.showNotification("top", "center", 1, "Ingrese el costo ");
      return false;
    }

    if (this.producto.stock <= 0) {
      this.showNotification("top", "center", 1, "Ingrese el stock ");
      return false;
    }

    if (this.producto.categoria <= 0) {
      this.showNotification("top", "center", 1, "Ingrese la categoria ");
      return false;
    }

    return true;
  }

  GuardarProducto() {

    console.log("Valor actual de this.producto.precio:", this.producto.precio);

    if (!this.validarProducto()) {
      return;
    }


    if (this.producto.id == 0) {
      if (!this.file) {
        this.showNotification("top", "center", 4, "Ingrese un archivo ");
        return;
      }

      this.prodService.uploadImage(this.file).subscribe(
        (data: RespImgbb) => {
          this.producto.img = data.data.url;

          this.SaveProduct(this.producto);
          this.file = undefined;
        },
        (err) => {
          console.log(err);
          this.showNotification(
            "top",
            "center",
            4,
            "Ocurrio un error al subir la imagen, intente mas tarde "
          );
        }
      );
    } else {
      if (this.file) {
        this.prodService.uploadImage(this.file).subscribe(
          (data: RespImgbb) => {
            this.producto.img = data.data.url;
            this.editarP();
            this.file = undefined;
          },
          (err) => {
            console.log(err);
            this.showNotification(
              "top",
              "center",
              4,
              "Ocurrio un error al subir la imagen, intente mas tarde "
            );
          }
        );
      } else {
        this.editarP();
      }
    }
    console.log("Precio después de la edición y antes de la subida:", this.producto.precio);
  }

  SaveProduct(producto: IRequestProduct) {
    console.log(producto)
    this.prodService.postProducto(producto).subscribe(
      async (data: IRespProduct) => {
        this.producto = {
          id: 0,
          nombre: "",
          img: "",
          precio: 0,
          peso: 0,
          stock: 0,
          estado: 1,
          codigo: "",
          categoria: 0,
        };
        this.pondFiles = [];
        this.myPond.removeFiles()
        await this.reload();
        this.closeModal.nativeElement.click();
        this.showNotification("top", "center", 2, data.msg)
      },
      (err) => {
        if (err["error"].errors != undefined) {
          let msg = "";
          let cant = err["error"].errors.length;
          for (let index = 0; index < cant; index++) {
            const element = err["error"].errors[index];
            if (index + 1 == cant) {
              msg += element.msg;
            } else {
              msg += element.msg + ", ";
            }
          }
          this.showNotification("top", "center", 4, msg);
        } else {
          let er: IResp = err["error"];
          this.showNotification("top", "center", 4, er.msg);
        }
      }
    );
    console.log(producto.precio)
  }

  @ViewChild("myPond") myPond: any;

  pondOptions = {
    class: "my-filepond",
    multiple: false,
    labelIdle: "Arrastre su archivo aqui...",
    acceptedFileTypes: "image/jpeg, image/png",
  };

  pondFiles: filepond.FilePondOptions["files"] = [];

  pondHandleInit() {
    console.log("FilePond has initialised", this.myPond);
  }

  file: any;
  pondHandleAddFile(event: any) {
    console.log("A file was added", event);
    this.file = event.file.file;
  }

  pondHandleActivateFile(event: any) {
    console.log("A file was activated", event);
  }

  showNotification(from, align, color, message) {
    switch (color) {
      case 1:
        this.toastr.info(
          `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message"> ${message}</span>`,
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-info alert-with-icon",
            positionClass: "toast-" + from + "-" + align,
          }
        );
        break;
      case 2:
        this.toastr.success(
          `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">${message}</span>`,
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-success alert-with-icon",
            positionClass: "toast-" + from + "-" + align,
          }
        );
        break;
      case 3:
        this.toastr.warning(
          `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message"> ${message}</span>`,
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-warning alert-with-icon",
            positionClass: "toast-" + from + "-" + align,
          }
        );
        break;
      case 4:
        this.toastr.error(
          `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message"> ${message}</span>`,
          "",
          {
            timeOut: 4000,
            enableHtml: true,
            closeButton: true,
            toastClass: "alert alert-danger alert-with-icon",
            positionClass: "toast-" + from + "-" + align,
          }
        );
        break;
      case 5:
        this.toastr.show(
          `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message"> ${message}</span>`,
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-primary alert-with-icon",
            positionClass: "toast-" + from + "-" + align,
          }
        );
        break;
      default:
        break;
    }
  }

  async reload() {
    let dt = await this.dtElement.dtInstance;
    dt.ajax.reload();
  }

  ngAfterViewInit(): void {
    var _thisDoc = this;
    $("#producto-table").on("click", "#EditarProducto", function (data) {
      let datas = $("#producto-table")
        .DataTable()
        .row($(this).parents("tr"))
        .data() as ResponseProduct;
      console.log(datas)
      _thisDoc.EditarProducto(datas);
    });

    $("#producto-table").on("click", "#EliminarProducto", function (data) {
      let datas = $("#producto-table")
        .DataTable()
        .row($(this).parents("tr"))
        .data() as ResponseProduct;
      _thisDoc.EliminarProducto(datas);
    });
  }

  EditarProducto(producto: ResponseProduct) {
    this.producto.id = producto.ID;
    this.producto.nombre = producto.Nombre;
    this.producto.precio = producto.Precio
    this.producto.peso = producto.Peso;
    this.producto.img = producto.ImgUrl;
    this.producto.stock = producto.Stock;
    this.producto.estado = 1;
    this.producto.codigo = producto.Codigo;
    this.producto.categoria = producto.ID_CAT;

    console.log("Valor actual de producto.precio:", this.producto.precio);
  }

  editarP() {
    console.log("Iniciando edición de producto");
    this.loading = true;

    this.prodService.putProducto(this.producto).subscribe(
      async (data: IRespProduct) => {
        if (data.status == 200) {
          this.producto = {
            id: 0,
            nombre: "",
            img: "",
            precio: 0,
            peso: 0,
            stock: 0,
            estado: 1,
            codigo: "",
            categoria: 0,
          };
          this.pondFiles = [];
          this.myPond.removeFiles();
          await this.reload();
          this.closeModal.nativeElement.click(); //<-- here
          this.showNotification("top", "center", 2, data.msg);
        }
        this.loading = false;
        console.log("Edición de producto completada");
      },
      (err) => {
        if (err["error"].errors != undefined) {
          let msg = "";
          let cant = err["error"].errors.length;
          for (let index = 0; index < cant; index++) {
            const element = err["error"].errors[index];
            if (index + 1 == cant) {
              msg += element.msg;
            } else {
              msg += element.msg + ", ";
            }
          }
          this.showNotification("top", "center", 4, msg);
        } else {
          let er: IRespProduct = err["error"];
          this.showNotification("top", "center", 4, er.msg);
        }
        this.loading = false;
        console.log("Error al editar producto");
      }
    );
  }
  EliminarProducto(producto: ResponseProduct) {
    this.producto.id = producto.ID;
    this.producto.nombre = producto.Nombre;
    this.producto.precio = producto.Precio;
    this.producto.peso = producto.Peso;
    this.producto.img = producto.ImgUrl;
    this.producto.stock = producto.Stock;
    this.producto.estado = 0;
    this.producto.codigo = producto.Codigo;
    this.producto.categoria = producto.ID_CAT;

    this.prodService.putProducto(this.producto).subscribe(
      async (data: IRespProduct) => {
        if (data.status == 200) {
          this.producto = {
            id: 0,
            nombre: "",
            img: "",
            precio: 0,
            peso: 0,
            stock: 0,
            estado: 1,
            codigo: "",
            categoria: 0,
          };
          await this.reload();
          //this.closeModal.nativeElement.click(); //<-- here
          this.showNotification("top", "center", 2, data.msg);
        }
      },
      (err) => {
        if (err["error"].errors != undefined) {
          let msg = "";
          let cant = err["error"].errors.length;
          for (let index = 0; index < cant; index++) {
            const element = err["error"].errors[index];
            if (index + 1 == cant) {
              msg += element.msg;
            } else {
              msg += element.msg + ", ";
            }
          }
          this.showNotification("top", "center", 4, msg);
        } else {
          let er: IRespProduct = err["error"];
          this.showNotification("top", "center", 4, er.msg);
        }
      }
    );
  }
}
