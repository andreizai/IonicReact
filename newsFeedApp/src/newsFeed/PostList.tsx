import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Post from './Post';
import { getLogger } from '../core';
import { ItemContext } from './PostProvider';
import { AuthContext } from '../auth';

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError, getNext, disableInfiniteScroll } = useContext(ItemContext);
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout?.();
  }
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>News Feed
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items"/>
        {items && (
          <IonList>
            {items.map(({ _id, text, title, date, edited, version }) =>
              <Post key={_id} _id={_id} text={text} title={title} date={date} edited={edited} version={version} onEdit={id => history.push(`/post/${id}`)}/>)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/post')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                           onIonInfinite={(e: CustomEvent<void>) => getNext?.(e, items)}>
          <IonInfiniteScrollContent
            loadingText="Loading more Posts">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
