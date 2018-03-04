import * as ActionTypes from './ActionTypes';

export const sourceUpdate = (source, lastCharacterInput=null) => {
    return {
        type: ActionTypes.SOURCE_UPDATE,
        source: source,
        lastCharacter: lastCharacterInput
    }
}

export const compileError = (error) => {
    return {
        type: ActionTypes.ERROR_UPDATE,
        error: error
    }
}
