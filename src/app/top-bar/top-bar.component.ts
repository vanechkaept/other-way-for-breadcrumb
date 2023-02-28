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

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BreadcrumbComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() breadcrumbLinks = BR;

  @ViewChild('breadcrumbContainer', { static: false })
  breadcrumbContainer: ElementRef;

  @ViewChild('homeLink', { static: false })
  homeElement: ElementRef;

  @ViewChild('currentLink', { static: false })
  currentElement: ElementRef;

  // @ViewChild('moreButtonContainer', { static: false })
  // moreButtonContainer: ElementRef;

  private resizeSubscription: Subscription;

  breadcrumbsData$: Observable<BreadcrumnPrepareData>;

  private _width$ = new BehaviorSubject<number>(0);
  // todo use in the future
  private _observer: ResizeObserver = new ResizeObserver((entries) => {
    this._width$.next(entries[0].contentRect.width);
    // update
    setTimeout(() => this._cd.detectChanges(), 100);
  });

  constructor(private _cd: ChangeDetectorRef) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.breadcrumbsData$ = this._width$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      // startWith(1000),
      map((width: number) => this._handleResize(width))
    );
    this._observer.observe(this.breadcrumbContainer.nativeElement);

    // this.resizeSubscription = fromEvent(window, 'resize')
    //   .pipe(debounceTime(100), distinctUntilChanged())
    //   .subscribe(() => this.handleResize());
    // this.handleResize();
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private _handleResize(width: number): BreadcrumnPrepareData {
    const breadcrumbContainerWidth: number = width;

    const breadcrumbLinks = this.breadcrumbLinks.slice();
    const homeLinkWidth: number = this._measureLinkWidth(
      breadcrumbLinks.splice(0, 1)[0].label
    );
    // const breadcrumbLinks = this.breadcrumbLinks.slice();
    const currentLinkWidth: number =
      this.currentElement.nativeElement.offsetWidth;
    // TODO: add abitity to calculate homeLink icon and more icon
    let totalLinkWidth: number = homeLinkWidth + currentLinkWidth;

    // icluded more button width to calculate all total width
    const addLinkWidth: number =
      breadcrumbLinks.reduce(
        (acc, curr) => (acc += this._measureLinkWidth(curr.label)),
        0
      ) + totalLinkWidth;

    if (breadcrumbContainerWidth < addLinkWidth) {
      const moreButtonWidth = this._measureLinkWidth('...');
      totalLinkWidth += moreButtonWidth;
    }
    const visibleLinks: BreadcrumbLink[] = [];
    const hiddenLinks: BreadcrumbLink[] = [];

    for (const breadcrumbLink of breadcrumbLinks.reverse()) {
      const linkWidth: number = this._measureLinkWidth(breadcrumbLink.label);
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
      currentLink: this.breadcrumbLinks[3],
    };
  }

  private _measureLinkWidth(label: string): number {
    const el = this.homeElement.nativeElement.cloneNode(true);
    el.firstChild.innerHTML = label;
    document.body.appendChild(el);
    // console.log(d.offsetWidth);
    const width = el.offsetWidth;
    document.body.removeChild(el);
    return width;

    ///////////////////////////////////
    // const d = this.homeElement.nativeElement?.copy(true) || null;
    // d.firstChild.innerHTML = 'label';
    // console.log(d.offsetWidth);
    // return d ? d.offsetWidth : 0;
    // const linkElement = document.createElement('a');
    // const styles = getComputedStyle(this.breadcrumbContainer.nativeElement);
    // // linkElement.style = styles;
    // linkElement.textContent = label;
    // linkElement.style.position = 'absolute';
    // document.body.appendChild(linkElement);
    // const width = linkElement.clientWidth;
    // const newContent = document.createTextNode(label);
    // document.body.removeChild(linkElement);
    // return width;
    /////////////////////////////. this works:
    // const span = document.createElement('a');
    // span.innerText = label;
    // span.style.position = 'absolute';
    // span.style.top = '-1000px';
    // span.style.left = '-1000px';
    // document.body.appendChild(span);
    // const width = span.offsetWidth;
    // document.body.removeChild(span);
    // return width;
    /////////////////////////////. this works best:
    // console.log(
    //   'asd',
    //   this.breadcrumbContainer.nativeElement as HTMLDivElement
    // );
    //  getComputedStyle(element)
    // const canvas = document.createElement('canvas');
    // const context = canvas.getContext('2d');
    // // TODO get link
    // const styles = getComputedStyle(this.breadcrumbContainer.nativeElement);
    // // context.font = "12px 'Roboto', Arial, sans-serif";
    // context.font = styles.font;
    // canvas.remove();
    // // console.log(context.measureText(label).width);
    // return context.measureText(label).width;
    /////////////////////////////
    // const newBlock = document.createElement('a');
    // const newContent = document.createTextNode(label);
    // newBlock.appendChild(newContent);
    // return newBlock.offsetWidth;
    /////////////////////////////
    // const link = document.createElement('a');
    // // Set the text content of the anchor element to the label
    // link.textContent = label;
    // // Set the href attribute of the anchor element to #
    // link.setAttribute('href', '#');
    // // Add the anchor element to the document body
    // document.body.appendChild(link);
    // // Get the width of the anchor element
    // const blockWidth = link.offsetWidth;
    // // Remove the anchor element from the document body
    // document.body.removeChild(link);
    // console.log(blockWidth);
    // // Return the block width of the anchor element
    // return blockWidth;
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
    label: 'Home',
    url: '1',
  },
  {
    label: '2 second ',
    url: '2',
  },
  {
    label: '3 third ',
    url: '3',
  },
  {
    label: '4 four ',
    url: '4',
  },
  {
    label: '5 five ',
    url: '5',
  },
];
