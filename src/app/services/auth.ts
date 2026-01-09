import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  SignUp(email:string, password:string){
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
  }

//   SignUp(formData: { email: string, password: string }) {
//   localStorage.setItem('email', formData.email);
//   localStorage.setItem('password', formData.password);
// }
  
  login(email:string, password:string) : Observable<boolean>{
  
    let _email = localStorage.getItem('email');
    let _password = localStorage.getItem('password');
    
    if(email == _email && password == _password){
      return of(true);
    }
    else{
      return of(false);
    }
  }
}
