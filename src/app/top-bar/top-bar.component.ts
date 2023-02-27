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

  @ViewChild('breadcrumbContainer', { static: false })
  breadcrumbContainer: ElementRef;

  private resizeSubscription: Subscription;

  private _width$ = new BehaviorSubject<number>(0);
  // todo use in the future
  private _observer: ResizeObserver = new ResizeObserver((entries) => {
    this._width$.next(entries[0].contentRect.width);
  });

  visibleLinks: BreadcrumbLink[] = [];
  hiddenLinks: BreadcrumbLink[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    this._observer.observe(this.breadcrumbContainer.nativeElement);
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
    const breadcrumbContainerWidth: number =
      this.breadcrumbContainer.nativeElement.offsetWidth;

    const breadcrumbLinks = this.breadcrumbLinks.slice();
    const homeLink = breadcrumbLinks.splice(0, 1)[0];
    const currentLink = breadcrumbLinks.splice(-1)[0];
    let totalLinkWidth: number =
      this.measureLinkWidth(homeLink.label) +
      this.measureLinkWidth(currentLink.label);
    let visibleLinks: BreadcrumbLink[] = [];
    let hiddenLinks: BreadcrumbLink[] = [];

    for (const breadcrumbLink of breadcrumbLinks.reverse()) {
      const linkWidth: number = this.measureLinkWidth(breadcrumbLink.label);
      // console.log(`${breadcrumbLink.label}`, linkWidth);
      if (totalLinkWidth + linkWidth > breadcrumbContainerWidth) {
        hiddenLinks.push(breadcrumbLink);
      } else {
        visibleLinks.push(breadcrumbLink);
        totalLinkWidth += linkWidth;
      }
    }
    // reverse because before thats we reverse all breadcrumbLinks array
    visibleLinks.reverse();
    hiddenLinks.reverse();
    // dont forget push this
    visibleLinks.unshift(homeLink);
    visibleLinks.push(currentLink);

    this.visibleLinks = visibleLinks;
    this.hiddenLinks = hiddenLinks;
  }

  private measureLinkWidth(label: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "16px 'Roboto', Arial, sans-serif";
    canvas.remove();
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
