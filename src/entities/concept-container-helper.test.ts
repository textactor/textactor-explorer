
import test from 'ava';
import { ConceptContainerHelper } from './concept-container-helper';
import { ConceptContainerStatusKeys, ConceptContainerStatus } from './concept-container';

test('#canStartCollect', t => {
    const pass = [ConceptContainerStatus.NEW];
    for (let status of ConceptContainerStatusKeys) {
        if (~pass.indexOf(status)) {
            t.true(ConceptContainerHelper.canStartCollect(status),
                `can start collect for: ${status}`);
        } else {
            t.false(ConceptContainerHelper.canStartCollect(status),
                `cannot start collect for: ${status}`);
        }
    }
});

test('#canStartGenerate', t => {
    const pass = [
        ConceptContainerStatus.COLLECT_DONE,
        ConceptContainerStatus.COLLECT_ERROR,
        ConceptContainerStatus.GENERATE_ERROR,
    ];
    for (let status of ConceptContainerStatusKeys) {
        if (~pass.indexOf(status)) {
            t.true(ConceptContainerHelper.canStartGenerate(status),
                `can start generate for: ${status}`);
        } else {
            t.false(ConceptContainerHelper.canStartGenerate(status),
                `cannot start generate for: ${status}`);
        }
    }
});

test('#newId', t => {
    t.is(typeof ConceptContainerHelper.newId(), 'string');
});

// test('#validate', t => {
//     t.throws(() => ConceptContainerHelper.validate(null), /null or undefined/);
//     t.throws(() => ConceptContainerHelper.validate({
//         id: ''
//     }), /invalid id/);
//     t.throws(() => ConceptContainerHelper.validate({
//         id: 'null', lang: ''
//     }), /invalid lang/);
// });
