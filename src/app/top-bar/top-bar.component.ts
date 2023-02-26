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
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() breadcrumbLinks = BR;

  visibleItems: BreadcrumbLink[] = [];
  hiddenItems: BreadcrumbLink[] = [];

  constructor() {}

  ngOnInit(): void {
    this.updateBreadcrumb();
    window.addEventListener('resize', this.updateBreadcrumb.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateBreadcrumb.bind(this));
  }

  updateBreadcrumb() {
    const breadcrumb = this.breadcrumbLinks.slice();
    const breadcrumbWidth = this.getBreadcrumbWidth();
    let visibleWidth = 0;

    this.visibleItems = [];
    this.hiddenItems = [];

    while (breadcrumb.length > 0) {
      const item = breadcrumb.shift();
      visibleWidth += this.getItemWidth(item);
      if (visibleWidth < breadcrumbWidth) {
        this.visibleItems.push(item);
      } else {
        this.hiddenItems.push(item);
      }
    }
  }

  getItemWidth(item: BreadcrumbLink): number {
    const element = document.createElement('span');
    element.innerText = item.label;
    element.style.visibility = 'hidden';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    document.body.appendChild(element);
    const width = element.offsetWidth;
    document.body.removeChild(element);
    return width;
  }

  getBreadcrumbWidth(): number {
    const breadcrumb = document.getElementsByClassName('breadcrumb')[0];
    return breadcrumb ? (breadcrumb as any)?.offsetWidth : 0;
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
