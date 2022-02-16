package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/NoF0rte/gocdp"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "cdp",
	Short: "Content discovery parser",
	RunE: func(cmd *cobra.Command, args []string) error {
		file, _ := cmd.Flags().GetString("file")
		results, err := gocdp.SmartParseFile(file)
		if err != nil {
			return err
		}

		grouped := results.GroupByStatus()

		data, err := json.MarshalIndent(grouped[200], "", " ")
		if err != nil {
			return err
		}
		fmt.Println(string(data))
		return nil
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	rootCmd.Flags().StringP("file", "f", "", "the content discovery file to parse")
}
