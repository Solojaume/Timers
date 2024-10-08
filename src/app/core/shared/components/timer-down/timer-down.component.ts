import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Type, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigTimmerModel } from '../../model/ConfigTimmerModel';
import { ITime } from '../../model/Interfaces/ITime';
import { StorageService } from '../../services/storage/storage.service';
import { TimerService } from '../../services/timer.service';
import { TimerConfigModalComponent } from '../modals/timer-config-modal/timer-config-modal.component';
import { ModalConfigComponent } from '../modals/modal-config/modal-config.component';

@Component({
  selector: 'app-timer-down',
  templateUrl: './timer-down.component.html',
  styleUrls: ['./timer-down.component.scss']
})
export class TimerDownComponent implements OnInit {
  @Input() public configTimer: ConfigTimmerModel = new ConfigTimmerModel();
  @Output() finalizado = new EventEmitter<boolean>;
  @Input() public type: string = "default";
  @Input() public palette: string = "midnight-light";
  @Input() public oppenControllers: string = "default-controllers-openned";

  public active_button_background:string = "";

  constructor(
    private _modalService: NgbModal,
    public timmerService: TimerService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    if(this.type === "strambothic_theme"){
      this.active_button_background = "btn-background-actived";
    }
  }

  tiempo: any = 0;
  segundosConfigurables = true;
  ctrl = new FormControl();
  hourStep = 1;
  minuteStep = 1;
  secondStep = 30;
  @ViewChild('days', { static: true }) days!: ElementRef;
  @ViewChild('hours', { static: true }) hours!: ElementRef;
  @ViewChild('minutes', { static: true }) minutes!: ElementRef;
  @ViewChild('seconds', { static: true }) seconds!: ElementRef;

  desplegar() {
    this.timmerService.deseleccionarTimmer();
    console.log("selected:", this.configTimer.position);
    this.timmerService.selectedTimerPosition = this.configTimer.position;
    this.configTimer.classSelected = "selected";
  }

  /*________________________ Variable CONFIGURACIONES ___________________________*/
  //Aquí se dice como ha de tratar el comienzo de un temporizador cuando se intenta empezar con 0
  configObcionesInicioTemporizadorSiEs0 = "empezar";
  /*
  Puede ser:
   error                   ---- Sirve para avisar al usuario de que esta función no está permitida
   default/empezar         ---- Empezará el temporizador desde 0;
   poner1SegYEmpezar       ---- Pone que el tiempo objetivo es un segundo y arranca el temporizador
   ponerTiempoPerYEmpezar  ---- Funciona igual que el anterior pero con la diferencia que el tiempo lo ha introducido previamente el usuario
  */
  play() {
    //alert("ALERTA SISMICA SE HA ESTABLECIDO UN TEMPORIZADOR DE" + this.tiempo+ "segundos")

    if (this.tiempo === 0) {
      switch (this.configObcionesInicioTemporizadorSiEs0) {
        case "error":
          alert("No puedes iniciar un temporizador que tenga los segundos, minutos y horas a cero");
          break;
        case "poner1SegYEmpezar":
          this.configTimer.playTimmer(1);
          break;
        case "ponerTiempoPerYEmpezar":
          let defaultTimmer = 1;
          this.configTimer.playTimmer(defaultTimmer);
          break;
        default:
          this.configTimer.playTimmer(this.tiempo);
          break;
      }

    }
    else {
      this.configTimer.playTimmer(this.tiempo);
    }
  }

  reset() {
    this.configTimer.resetTimmer();
  }

  pause() {
    this.configTimer.pausarTimmer();
  }

  finalizar() {
    this.configTimer.finalizarTimmer();
  }

  resume() {
    this.configTimer.arrancarTimer();
  }

  actualizarConfigTimer(datos: ITime) {
    this.configTimer.hour = datos.hour;
    this.configTimer.minutos = datos.minutos;
    this.configTimer.segundos = datos.segundos;
    this.tiempo = datos.tiempoAContar;
  }

  open(name: string) {
    let modal = this._modalService.open(MODALS[name]);
    modal.closed.subscribe((closed: any) => {
      //console.log('CLOSED modal:', closed);
      if (closed != null) {
        this.configTimer.nombre = closed.nombre;
        
        this.storageService.saveTemporizadores();
      }
    });

    modal.dismissed.subscribe((dismis: any) => {
      //console.log('Dismis modal:', dismis);
    });
  }

  eliminar() {
    this.timmerService.deleteTimmer();
    this.storageService.saveTemporizadores();
  }

}

const MODALS: { [name: string]: Type<any> } = {
  autofocus: TimerConfigModalComponent,
  general_config: ModalConfigComponent
};