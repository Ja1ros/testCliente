import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Root } from "app/Models/InterfacesProducts";
import { CodigoBarrasService } from "app/Services/codigo.service";
import { ProductoService } from "app/Services/producto2.service";
import { ToastrService } from "ngx-toastr";
import * as JsBarcode from 'jsbarcode';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: "app-editar-producto",
  templateUrl: "./editar-producto.component.html",
  styleUrls: ["./editar-producto.component.scss"],
})
export class EditarProductoComponent implements OnInit {
  productoForm: FormGroup;
  titulo = "Editar producto";
  id: string | null;
  codigoBarras: string = "";
  codigoBarrasImageUrl: string = "";
  producto: Root = {};
  total: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private _productoService: ProductoService,
    private codigoBarrasService: CodigoBarrasService,
    private aRouter: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      nombre: [{ value: "", disabled: true }, Validators.required],
      codigo: [{ value: "", disabled: true }, Validators.required],
      peso: ["", Validators.required],
      precio: ["", Validators.required],
      codigoBarras: ["", Validators.required],
    });
    this.id = this.aRouter.snapshot.paramMap.get("id");
  }

  ngOnInit(): void {
    this.obtenerProducto()
  }

  obtenerProducto() {
    if (this.id !== null) {
      this._productoService.obtenerProducto(this.id).subscribe(data => {
        this.producto = data;
        //console.log('rrrrrr',  this.producto)
        this.productoForm.patchValue({
          nombre: data.Nombre,
          codigo: data.Codigo,
          peso: data.Peso,
          precio: data.Precio,
        });
        
      });
    }
  }

  calcularCodigoBarras() {
    let codigo = this.productoForm.get("codigo")?.value;
    codigo = codigo.toString();
    //console.log(codigo, codigo.length)
    if (codigo.length < 4) {
      const i = 4 - codigo.length
      let prefix = "";
      for (let index = 0; index < i; index++) {
        prefix += "0"
      }
      codigo = prefix + codigo;
    }
    const peso = this.productoForm.get("peso")?.value;
    const precio = this.productoForm.get("precio")?.value;

    let total = this.producto.Precio * peso;

        // Redondear al segundo decimal
        total = Number(total.toFixed(2));
        // Verificar si el tercer decimal es mayor a 5
        const tercerDecimal = total * 1000 % 10;
        if (tercerDecimal > 5) {
          // Redondear al segundo decimal también
          total = Number((total + 0.01).toFixed(2));
        }
        this.total = total;

    this.cdr.detectChanges();
    this.codigoBarras = this.codigoBarrasService.calcularCodigoBarras(
      codigo, peso, precio);

    JsBarcode("#barcode", this.codigoBarras);
    this.productoForm.patchValue({
      codigoBarras: this.codigoBarras,
    });
  }
}
