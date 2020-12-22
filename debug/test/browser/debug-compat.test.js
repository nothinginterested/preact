import { createElement, createRoot, createRef } from 'preact';
import { setupScratch, teardown } from '../../../test/_util/helpers';
import './fakeDevTools';
import 'preact/debug';
import * as PropTypes from 'prop-types';

// eslint-disable-next-line no-duplicate-imports
import { resetPropWarnings } from 'preact/debug';
import { forwardRef } from 'preact/compat';

const h = createElement;
/** @jsx createElement */

describe('debug compat', () => {
	let scratch;
	let errors = [];
	let warnings = [];
	let render;

	beforeEach(() => {
		errors = [];
		warnings = [];
		scratch = setupScratch();
		({ render } = createRoot(scratch));

		sinon.stub(console, 'error').callsFake(e => errors.push(e));
		sinon.stub(console, 'warn').callsFake(w => warnings.push(w));
	});

	afterEach(() => {
		/** @type {*} */
		(console.error).restore();
		console.warn.restore();
		teardown(scratch);
	});

	describe('PropTypes', () => {
		beforeEach(() => {
			resetPropWarnings();
		});

		it('should not fail if ref is passed to comp wrapped in forwardRef', () => {
			// This test ensures compat with airbnb/prop-types-exact, mui exact prop types util, etc.

			const Foo = forwardRef(function Foo(props, ref) {
				return <h1 ref={ref}>{props.text}</h1>;
			});

			Foo.propTypes = {
				text: PropTypes.string.isRequired,
				ref(props) {
					if ('ref' in props) {
						throw new Error(
							'ref should not be passed to prop-types valiation!'
						);
					}
				}
			};

			const ref = createRef();

			render(<Foo ref={ref} text="123" />);

			expect(console.error).not.been.called;

			expect(ref.current).to.not.be.undefined;
		});
	});
});
