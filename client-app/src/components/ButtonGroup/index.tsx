
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

interface ButtonOption {
  label: string;
  value: string;
}

interface ButtonGroupProps {
  options: ButtonOption[];
  onChange: (value: string) => void;
  selectedValue?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, onChange, selectedValue }) => {
  const [selected, setSelected] = useState<string>(selectedValue || options[0]?.value);

  const handlePress = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selected === option.value && styles.selectedButton,
          ]}
          onPress={() => handlePress(option.value)}
        >
          <Text style={[styles.text, selected === option.value && styles.selectedText]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ButtonGroup;