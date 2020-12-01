import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './PostProvider';
import { RouteComponentProps } from 'react-router';
import { PostProps } from './PostProps';

const log = getLogger('ItemEdit');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem } = useContext(ItemContext);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [item, setItem] = useState<PostProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setText(item.text);
      setTitle(item.title);
    }
  }, [match.params.id, items]);
  const handleSave = () => {
    let editedItem = undefined;
    if(item){
      editedItem = item;
      editedItem.text = text;
      editedItem.title = title;
    }else{
      editedItem = {
        text: text,
        title: title,
        version: 1,
        edited: false,
        date: ""
      }
    }
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>Titlu</IonLabel>
        <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
        <IonLabel>Text</IonLabel>
        <IonInput value={text} onIonChange={e => setText(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
