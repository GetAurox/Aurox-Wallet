import { TypedEmitter } from "tiny-typed-emitter";
import eq from "lodash/eq";

import { StateFragment } from "common/types";

import type { CommonStateConsumer } from "./CommonStateConsumer";

export interface CommonStateConsumerFragmentEvents<F> {
  "changing": (oldFragment: F, newFragment: F) => void;
  "changed": (newFragment: F) => void;
}

export class CommonStateConsumerFragment<Data extends NonNullable<object>, F>
  extends TypedEmitter<CommonStateConsumerFragmentEvents<F>>
  implements StateFragment<F>
{
  private _consumer: CommonStateConsumer<string, Data>;
  private _selector: (data: Data) => F;
  private _areEqual: (a: F, b: F) => boolean;

  private _currentFragment: F;

  constructor(consumer: CommonStateConsumer<string, Data>, selector: (data: Data) => F, areEqual?: (a: F, b: F) => boolean) {
    super();

    this._consumer = consumer;
    this._selector = selector;
    this._areEqual = areEqual ?? eq;

    this._currentFragment = this._selector(this._consumer.getCurrent());

    this._consumer.addListener("changed", this.handleUpstreamChanged);
  }

  private handleUpstreamChanged = (newData: Data) => {
    const newFragment = this._selector(newData);

    if (!this._areEqual(this._currentFragment, newFragment)) {
      this.emit("changing", this._currentFragment, newFragment);

      this._currentFragment = newFragment;

      this.emit("changed", this._currentFragment);
    }
  };

  public getCurrent = () => {
    return this._currentFragment;
  };

  public detach() {
    this._consumer.removeListener("changing", this.handleUpstreamChanged);
  }
}
