import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { IconButton } from 'react-native-paper';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  mode: 'contained' | 'outlined';
  icon?: string;
  style?: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  onPress, 
  title, 
  mode, 
  icon, 
  style 
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        mode === 'contained' 
          ? [styles.containedButton, { backgroundColor: theme.colors.primary }]
          : [styles.outlinedButton, { borderColor: theme.colors.primary }],
        style
      ]}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <IconButton
            icon={icon}
            size={20}
            iconColor={mode === 'contained' ? 'white' : theme.colors.primary}
            style={styles.icon}
          />
        )}
        <Text 
          style={[
            styles.text,
            mode === 'contained' 
              ? [styles.containedText, { color: 'white' }]
              : [styles.outlinedText, { color: theme.colors.primary }]
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containedButton: {
    elevation: 2,
  },
  outlinedButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  containedText: {},
  outlinedText: {},
  icon: {
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default CustomButton;
