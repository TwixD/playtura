import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-form-error-handler',
  templateUrl: './form-error-handler.component.html',
  styleUrls: ['./form-error-handler.component.scss'],
})
export class FormErrorHandlerComponent implements OnInit {

  @Input() parentForm: any;
  @Input() fieldName: string;
  @Input() fieldLabel: string;

  constructor() { }

  ngOnInit() { }

  showError(field, error): boolean {
    return this.parentForm.get(field).hasError(error) && this.parentForm.get(field).dirty;
  }

}