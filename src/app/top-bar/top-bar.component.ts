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
export class BreadcrumbComponent implements OnDestroy, AfterViewInit {
  @Input() breadcrumbLinks = BR;

  @ViewChild('breadcrumbContainer', { static: false })
  breadcrumbContainer: ElementRef;

  @ViewChild('moreButtonContainer', { static: false })
  moreButtonContainer: ElementRef;

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

  ngAfterViewInit(): void {
    this.breadcrumbsData$ = this._width$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
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
    const breadcrumbContainerWidth: number =
      this.breadcrumbContainer.nativeElement.offsetWidth;

    // const moreButtonContainerWidth: number =
    //   this.moreButtonContainer.nativeElement.offsetWidth;
    console.log('----', this.moreButtonContainer?.nativeElement);

    const breadcrumbLinks = this.breadcrumbLinks.slice();
    const homeLink = breadcrumbLinks.splice(0, 1)[0];
    const currentLink = breadcrumbLinks.splice(-1)[0];
    let totalLinkWidth: number =
      this._measureLinkWidth(homeLink.label) +
      this._measureLinkWidth(currentLink.label);
    const visibleLinks: BreadcrumbLink[] = [];
    const hiddenLinks: BreadcrumbLink[] = [];

    for (const breadcrumbLink of breadcrumbLinks.reverse()) {
      const linkWidth: number = this._measureLinkWidth(breadcrumbLink.label);
      // console.log(`${breadcrumbLink.label}`, linkWidth);
      if (totalLinkWidth + linkWidth > breadcrumbContainerWidth) {
        hiddenLinks.push(breadcrumbLink);
      } else {
        visibleLinks.push(breadcrumbLink);
        totalLinkWidth += linkWidth;
      }
    }
    // reverse because before thats we reverse all breadcrumbLinks array
    visibleLinks.reverse().push(currentLink);
    hiddenLinks.reverse();
    // dont forget push this
    // visibleLinks.unshift(homeLink);
    // visibleLinks;

    console.log(visibleLinks);
    console.log(hiddenLinks);

    return {
      homeLink,
      visibleLinks,
      hiddenLinks,
    };
  }

  private _measureLinkWidth(label: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "16px 'Roboto', Arial, sans-serif";
    canvas.remove();
    console.log(context.measureText(label).width);
    return context.measureText(label).width;

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
  homeLink: BreadcrumbLink;
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
