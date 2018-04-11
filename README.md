# react-native-sf-image-zoom-viewer

# 图片查看器，支持手势缩放、分享

# 安装
> npm install react-native-sf-image-zoom-viewer

# 例子
```
import SFZoomView from 'react-native-sf-image-zoom-viewer';
export default class App extends React.Component {
  show=()=>{
    
  }
  render(){
    return(
      <View style={{flex:1,}}>
        ...
        ...
        <SFZoomView ref={(ref)=>{this.zoomViewer = ref}}/>
      </View>
    )
  }
}

```

# Props
|  parameter  |  type  |  required  |   description  |  default  |
|:-----|:-----|:-----|:-----|:-----|
|isShowAni|boolean|no|是否显示展示动画|true|
|isShowShare|boolean|no|是否显示分享按钮|true|
|onShare|function<br>()=>(index)=>{}|no|点击分享事件|()=>null|
