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
  NgZone,
} from '@angular/core';
import { Subscription, fromEvent, BehaviorSubject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  tap,
  publish,
} from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BreadcrumbComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() breadcrumbLinks = BR;
  @Input() homeCrumb = true;

  @ViewChild('breadcrumbContainer', { static: false })
  breadcrumbContainer: ElementRef;

  @ViewChild('homeLink', { static: false })
  homeElement: ElementRef;

  @ViewChild('currentLink', { static: false })
  currentElement: ElementRef;

  readonly seperateIcon = 'arrow_forward_ios';
  readonly menuText = '...';

  breadcrumbsData$: Observable<BreadcrumnPrepareData>;

  private _width$ = new BehaviorSubject<number>(0);

  // todo use in the future
  private _observer: ResizeObserver = new ResizeObserver((entries) => {
    /**
     * ResizeObserver runs outside of the zone. Unfortunately the template is not rerendered and keeps the initial value.
     * Easily fix that by manually running it in the zone
     * https://dev.to/christiankohler/how-to-use-resizeobserver-with-angular-9l5
     */
    this.zone.run(() => {
      this._width$.next(entries[0].contentRect.width);
    });
  });

  constructor(private _cd: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.breadcrumbsData$ = this._width$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map((width: number) => this._handleResize(width))
    );
    this._observer.observe(this.breadcrumbContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this._observer.unobserve(this.breadcrumbContainer.nativeElement);
  }

  private _handleResize(width: number): BreadcrumnPrepareData {
    const breadcrumbContainerWidth: number = width;

    const breadcrumbLinks = this.breadcrumbLinks.slice();
    // const homeLink = breadcrumbLinks.splice(0, 1)[0];
    // const homeLinkWidth: number = this._measureLinkWidth(homeLink.label);
    const homeLinkWidth = this.homeElement.nativeElement.offsetWidth;
    console.log('homeLinkWidth', homeLinkWidth);
    // const breadcrumbLinks = this.breadcrumbLinks.slice();
    const currentLink = breadcrumbLinks.splice(-1)[0];
    const currentLinkWidth: number =
      this.currentElement.nativeElement.offsetWidth;
    console.log('currentLinkWidth', currentLinkWidth);
    // TODO: add abitity to calculate homeLink icon and more icon
    let totalLinkWidth: number = homeLinkWidth + currentLinkWidth;

    // icluded more button width to calculate all total width
    const addLinkWidth: number =
      breadcrumbLinks.reduce(
        (acc, curr) => (acc += this._measureLinkWidth(curr.label)),
        0
      ) + totalLinkWidth;

    if (breadcrumbContainerWidth < addLinkWidth) {
      const moreButtonWidth = this._measureLinkWidth(this.menuText);
      // console.log('moreButtonWidth', moreButtonWidth);
      totalLinkWidth += moreButtonWidth;
    }
    const visibleLinks: BreadcrumbLink[] = [];
    const hiddenLinks: BreadcrumbLink[] = [];

    for (const breadcrumbLink of breadcrumbLinks.reverse()) {
      const linkWidth: number = this._measureLinkWidth(breadcrumbLink.label);
      console.log(breadcrumbLink.label, linkWidth);
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

    return {
      visibleLinks,
      hiddenLinks,
      currentLink,
      // homeLink,
    };
  }

  // check performance
  private _measureLinkWidth(label: string): number {
    const el = this.homeElement.nativeElement.cloneNode(true);
    el.firstChild.innerHTML = label;
    document.body.appendChild(el);
    const width = el.offsetWidth;
    document.body.removeChild(el);
    return width;
  }
}

interface BreadcrumbLink {
  label: string;
  url: string;
  isHidden?: boolean;
  el?: ElementRef;
}

interface BreadcrumnPrepareData {
  homeLink?: BreadcrumbLink;
  currentLink: BreadcrumbLink;
  visibleLinks: BreadcrumbLink[];
  hiddenLinks: BreadcrumbLink[];
}

const BR: BreadcrumbLink[] = [
  {
    label: 'components (2)',
    url: '2',
  },
  {
    label: 'button (3)',
    url: '3',
  },
  {
    label: 'api (4)',
    url: '4',
  },
  {
    label: 'data',
    url: '5',
  },
];
