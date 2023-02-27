import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import {
  MatButton,
  MatIcon,
  MatIconModule,
  MatButtonModule,
} from '@angular/material';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([{ path: '', component: ProductListComponent }]),
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    
  ],
  declarations: [AppComponent, BreadcrumbComponent, ProductListComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
