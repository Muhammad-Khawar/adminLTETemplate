import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignUp } from "./components/sign-up/sign-up";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project1');
}
