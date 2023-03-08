import { TypedEmitter } from "tiny-typed-emitter";

export interface StateFragmentEvents<F> {
  "changing": (oldFragment: F, newFragment: F) => void;
  "changed": (newFragment: F) => void;
}

export interface StateFragment<F> extends TypedEmitter<StateFragmentEvents<F>> {
  getCurrent: () => F;
}
