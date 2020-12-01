import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { PostProps } from './PostProps';
import { createItem, getItems, newWebSocket, updateItem } from './postApi';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';
import Post from './Post';

const log = getLogger('ItemProvider');

type SaveItemFn = (item: PostProps) => Promise<any>;

type GetNextFn = ($event: CustomEvent<void>, items?: PostProps[]) => Promise<any>;

export interface ItemsState {
  items?: PostProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  disableInfiniteScroll: boolean,
  saveItem?: SaveItemFn,
  getNext?: GetNextFn
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  disableInfiniteScroll: false,
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const MORE_ITEMS = 'MORE_ITEMS';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case MORE_ITEMS:
        return { ...state, items: payload.items}
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        const index = items.findIndex(it => it._id === item._id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = item;
        }
        return { ...state, items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, fetchingError, saving, savingError, disableInfiniteScroll } = state;
  useEffect(getItemsEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
  const getNext = useCallback<GetNextFn>(getMoreItems, []);
  const value = { items, fetching, fetchingError, saving, savingError, saveItem, getNext, disableInfiniteScroll };
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  async function getMoreItems($event: CustomEvent<void>, items?: PostProps[]){
    debugger;
    let lista = []
    for(var i=0; i<3; i++){
      const post : PostProps = {
        _id: "Craeted" + i,
        title: "Tilut"+i,
        date: new Date().toISOString(),
        version: i,
        edited: false,
        text: "Exemplu TXT"
      }
      lista.push(post);
    }
    dispatch({type: MORE_ITEMS, payload: {items: items?.concat(lista)} });
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  } 

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const items = await getItems(token);
        const {Storage} = Plugins;

        log('fetchItems succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
          await Storage.set({
            key: 'items',
            value: JSON.stringify(items)
          });
        }
      } catch (error) {
        
        const {Storage} = Plugins;
        const itemsS = await Storage.get({key: 'items'});
        if(itemsS.value){
          log('am gasit in local storege');
          const parsedValue = JSON.parse(itemsS.value);
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: parsedValue } });
        }else{
          log('fetchItems failed');
          dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
        }

      }
    }
  }

  async function saveItemCallback(item: PostProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (item._id ? updateItem(token, item) : createItem(token, item));
      log('saveItem succeeded');
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveItem failed');
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: item } = message;
        log(`ws message, item ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
