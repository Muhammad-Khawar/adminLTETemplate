import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginform: FormGroup;
  constructor(private _auth: Auth,private _router:Router){
    this.loginform = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  login(){
debugger
    if(this.loginform.invalid){
      this.loginform.markAllAsTouched();
      return;
    }
    const {email, password} = this.loginform.value;
    const result = this._auth.login(email, password).subscribe((result)=>{
      if(result){
      console.log('Successfully login');
       this._router.navigate(['/home']);
    }
    else
    {
      console.log('Login failed');
    }
    }
    );
  }

  reset(){
    this.loginform.reset();
  }

  SignUp(){
    this._router.navigate(['/signup']);
  }
}
