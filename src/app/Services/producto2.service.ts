import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../Models/producto';
import { environment } from 'environments/environment.prod';
import { IRequestProduct, IRespProduct, Root } from 'app/Models/InterfacesProducts';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  //url = 'https://apiproducts-ksqp.onrender.com/api/';
  //url = 'http://localhost:3000/api/';
  
  
  constructor(private http: HttpClient) { }

  URL = environment.API;
  opt = this.createRequestOptions();


  getProductos(): Observable<Producto[]>{
    return this.http.get<Producto[]>(this.URL + 'products', {
      headers: this.opt,
    });
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.URL}${id}`);
  }

  getProductosFac(){
    return this.http.get<IRespProduct>(this.URL + 'products/Fac', {
      headers: this.opt,
    });
  }

  guardarProducto(producto: IRequestProduct){
    return this.http.post<IRespProduct>(this.URL + 'products', producto, {
      headers: this.opt,
    });
  }

  actualizarProducto(producto: IRequestProduct){
    return this.http.put<IRespProduct>(this.URL + 'products', producto, {
      headers: this.opt,
    });
  }

  obtenerProducto(id: string) {
    console.log(id)
    return this.http.get<Root>(this.URL+`products/buscador/${id}`);
    //return this.http.get<Root>(`https://apiproducts-ksqp.onrender.com/api/products/buscador/${id}`);
   // return this.http.get<Root>(`http://localhost:3000/api/products/buscador/${id}`);
  }


  editarProducto(id: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.URL}${id}`, producto);
  }

  uploadImage(file:any){
    const formData = new FormData();
    console.log(file)
    formData.append('image', file)
    return this.http.post('https://api.imgbb.com/1/upload?key=5ce77e0698e3e45d85a2262bed67554e',formData )
  }

  private createRequestOptions() {
    let token =JSON.parse(localStorage.getItem("token"));
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      'x-token': token,
    });
    return headers;
  }
}