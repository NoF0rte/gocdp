package gocdp

import (
	"errors"
	"io"
	"os"
)

var DefaultParsers = []Parser{
	FfufParser{},
	GobusterParser{},
}

func SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	var allResults CDResults
	for _, file := range files {
		results, err := SmartParseFile(file)
		if err != nil {
			return nil, err
		}

		allResults = append(allResults, results...)
	}
	return allResults, nil
}

func SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return SmartParse(f, parsers...)
}

func SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if len(parsers) == 0 {
		parsers = DefaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return nil, errors.New("no parser found for file")
	}

	output, err := parser.Parse(input)
	if err != nil {
		return nil, err
	}
	return output, nil
}
