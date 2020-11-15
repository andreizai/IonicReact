import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonDatetime, IonItem, IonLabel, IonTitle } from '@ionic/react';
import { PostProps } from './PostProps';

interface PostPropsExt extends PostProps {
  onEdit: (_id?: string) => void;
}

const Post: React.FC<PostPropsExt> = ({ _id, text, title, version, edited, date,  onEdit }) => {
    let editedLabel;
    console.log("Mofidied!!! ->" + edited);
    if(edited == true){
        editedLabel = <IonLabel> Version {version}, Edited</IonLabel>
    }else{
        editedLabel = <IonLabel> Version {version}, Original Post</IonLabel>
    }
  return (

    <IonItem onClick={() => onEdit(_id)}>
        <IonCard class='card-post'>
            <IonCardHeader>
                <IonCardTitle> {title}</IonCardTitle>
                <IonCardSubtitle> 
                    <IonItem class='subtitle-card-post'>
                        <IonDatetime class='subtitle-card-post-date' value={date} display-timezone="utc" readonly={true} displayFormat="YYYY MMM DD, HH:mm"></IonDatetime>
                        {editedLabel}
                    </IonItem>
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
            {text}
            </IonCardContent>
        </IonCard>
    </IonItem>
  );
};

export default Post;
