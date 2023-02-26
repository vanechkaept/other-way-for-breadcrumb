import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  QueryList,
  TemplateRef,
  ViewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subscription, fromEvent, BehaviorSubject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  tap,
} from 'rxjs/operators';

interface BreadcrumbLink {
  label: string;
  url: string;
  isHidden?: boolean;
  el?: ElementRef;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BreadcrumbComponent implements OnDestroy, AfterViewInit {
  @Input() breadcrumbLinks = BR;

  @ViewChild('breadcrumbContainer', { static: true })
  breadcrumbContainer: ElementRef;

  private resizeSubscription: Subscription;

  visibleLinks: BreadcrumbLink[] = [];
  hiddenLinks: BreadcrumbLink[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => this.handleResize());
    this.handleResize();
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private handleResize(): void {
    const breadcrumbLinks: HTMLElement[] =
      this.breadcrumbContainer.nativeElement.querySelectorAll('a');
    const breadcrumbContainerWidth: number =
      this.breadcrumbContainer.nativeElement.offsetWidth;
    let totalLinkWidth: number = 0;
    let visibleLinks: BreadcrumbLink[] = [];
    let hiddenLinks: BreadcrumbLink[] = [];

    for (const breadcrumbLink of this.breadcrumbLinks) {
      const linkWidth: number = this.measureLinkWidth(breadcrumbLink.label);
      if (totalLinkWidth + linkWidth > breadcrumbContainerWidth) {
        hiddenLinks.push(breadcrumbLink);
      } else {
        visibleLinks.push(breadcrumbLink);
        totalLinkWidth += linkWidth;
      }
    }

    this.visibleLinks = visibleLinks;
    this.hiddenLinks = hiddenLinks;
  }

  private measureLinkWidth(label: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '14px Arial';
    return context.measureText(label).width;
  }
}

const BR: BreadcrumbLink[] = [
  {
    label: '1 first  ',
    url: '1',
    isHidden: false,
  },
  {
    label: '2 second ',
    url: '2',
    isHidden: false,
  },
  {
    label: '3 third ',
    url: '3',
    isHidden: false,
  },
  {
    label: '4 four ',
    url: '4',
    isHidden: true,
  },
  {
    label: '5 five ',
    url: '5',
    isHidden: false,
  },
];
