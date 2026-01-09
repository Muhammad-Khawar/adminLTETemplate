import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

  myform:FormGroup;

  // constructor(private _auth: Auth){
  //   this.myform = new FormGroup({
  //     email: new FormControl(''),
  //     password: new FormControl('')
  //   });
  // }

constructor(private _auth: Auth, private _router: Router) {
    this.myform = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }




//   signUp() {
//   console.log(this.myform.value);
//   const email = this.myform.get('email')?.value;
//   const password = this.myform.get('password')?.value;
  
//   this._auth.SignUp(email, password);
// }


// signUp() {
//   console.log(this.myform.value);
//   const { email, password } = this.myform.value;
//   this._auth.SignUp(email, password);
// }


// signUp() {
//   console.log(this.myform.value);
//   this._auth.SignUp(this.myform.value);
// }


signUp() {
  debugger
    // Check if form is valid
    if (this.myform.invalid) {
      // Mark all fields as touched to show errors
      this.myform.markAllAsTouched();
      return;
    }

    console.log('Form data:', this.myform.value);
    
    // Destructure form values
    const { email, password } = this.myform.value;
    
    // Call auth service
    this._auth.SignUp(email, password);
    
    // Reset form after submission
    this.myform.reset();
    // Navigate to login page after successful signup
    this._router.navigate(['/login']);
  }

  Reset(){
    this.myform.reset();
  }
}
