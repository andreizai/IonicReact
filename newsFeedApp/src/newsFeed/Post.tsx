import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonDatetime, IonItem, IonLabel, IonTitle } from '@ionic/react';
import { PostProps } from './PostProps';

interface PostPropsExt extends PostProps {
  onEdit: (_id?: string) => void;
}

const Post: React.FC<PostPropsExt> = ({ _id, text,  onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(_id)}>
        <IonCard>
            <IonCardHeader>
                <IonCardTitle> Titlu 123</IonCardTitle>
                <IonCardSubtitle> 
                    <IonItem class='subtitle-card-post'>
                        <IonDatetime class='subtitle-card-post-date' value="2019-10-01T15:43:40.394Z" display-timezone="utc" readonly={true} displayFormat="YYYY MMM DD, HH:mm"></IonDatetime>
                        <IonLabel>Version 1</IonLabel>
                    </IonItem>
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </IonCardContent>
        </IonCard>
    </IonItem>
  );
};

export default Post;
